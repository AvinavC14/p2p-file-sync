const express = require('express');
const multer  = require('multer')
const fs=require('fs')
const path=require('path')
const app=express();
const port=3000;
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

app.get("/download",(req,res)=>{
 const fileName=req.query.filename;
  res.download(`${__dirname}/upload/${fileName}`,(err)=>{
    if(err){
      console.log("file not found")
      res.send("file not found").status(404)
    }
  })

})

app.listen(port,()=>{console.log("Listening at http://localhost:3000")})