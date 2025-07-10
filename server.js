const express = require('express');
const multer  = require('multer')
const fs=require('fs')
const path=require('path')
const app=express();
const port=3000;
const chokidar=require('chokidar')
const http=require('http')
const {Server}=require('socket.io');

const server=http.createServer(app)
const io =new Server(server)

//io-this is the socket io server instance
//socket-is a specific connected client (per user)

//this returns the msg when is connection is successful
io.on("connection",(socket)=>{
try{ 
   console.log("User connected",socket.id); 
   //this is for signaling to initiate webrtc using socket io
socket.on("signal",({to,data})=>{
io.to(to).emit("signal",{from:socket.id,data}) 
})

//this nofies the peers when a new peer joins except the one who joined(therfore the use of broadcast.emit)
socket.on("join", () => {
  socket.broadcast.emit("peer-joined", socket.id);
  console.log(`User ${socket.id} has joined`);
});
}catch(err){
  console.log("error in socket io connnection"+err)
}
})



app.use(express.static(__dirname)); // This tells Express: "Serve any file (like script.js, index.html) from the current folder."

const uploaddir=path.join(__dirname,"upload");//this is the path to the upload folder
const storage = multer.diskStorage({
    //cb - callback
  destination: function (req, file, cb) {
   cb(null,'./upload') // cb(error,destination)
  },
  filename: function (req, file, cb) {
    cb(null,`${Date.now()}+${file.originalname}`) // cb(error,file name)
  }
})

//this function reads  and gets the metadata  for each file in the upload folder using fs.stat(file system)
const getfileMetadata=()=>{
  //this reads all the files in upload folder one by one
  const files=fs.readdirSync(uploaddir);
  //this function then returns he metadata for each file(name,size,uploadedAt)
 const fileData= files.map((file)=>{
   const filePath=path.join(uploaddir,file)
   const stats = fs.statSync(filePath)
   return {
    name:file,
    size: stats.size,
    uploadedAt:stats.birthtime
   }
  })
  return fileData
}

app.get("/files",(req,res)=>{
  const fileMetadata=getfileMetadata();
  res.json(fileMetadata)
})
 
const upload = multer({ storage: storage })
app.post("/upload",upload.single("Myfile"),(req,res)=>{
    res.send("File uploaded successfully!")
})
app.get("/",(req,res)=>{
    // __dirname gives you the absolute path to the folder where server.js is located.
    //'/index.html' adds the filename to that path.
res.sendFile(__dirname + '/index.html');
})

//using chokidar to detect file change and socket io to emit the res
chokidar.watch('./upload').on('all',(event,filePath)=>{
try{ 
  const fullpath=path.join(__dirname,filePath) // the path to the file where the event(add or modification) occured
  const fileName=path.basename(fullpath)
  console.log(`${event} occured at path ${filePath}`);
 if(event== 'change' || event == 'add'){
  const fileContent=fs.readFileSync(fullpath)
  io.emit('filesync',{event,fileName,content:fileContent.toString('base64')})//encoding the file content with base64 which converts binarydata into text for safety
 }else if(event=='unlink'){
  io.emit('filesync',{event,fileName})
 }
}catch(e){
  console.log("error in emiting file content"+e)
}})

//this enables the user to download the file from /upload
app.get("/download",(req,res)=>{
 const fileName=req.query.filename;
  res.download(`${__dirname}/upload/${fileName}`,(err)=>{
    if(err){
      console.log("file not found")
      res.send("file not found").status(404)
    }
  })

})
//this the socket io server
server.listen(port, () => {
  console.log("Server Listening at http://localhost:3000");
});