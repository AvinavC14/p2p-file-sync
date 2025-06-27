const express = require('express');
const multer  = require('multer')
 
const app=express();
const port=3000;

const storage = multer.diskStorage({
    //cb - callback
  destination: function (req, file, cb) {
   cb(null,'./upload') // cb(error,destination)
  },
  filename: function (req, file, cb) {
    cb(null,`${Date.now()}+${file.originalname}`) // cb(error,file name)
  }
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
app.listen(port,()=>{console.log("Listening at http://localhost:3000")})