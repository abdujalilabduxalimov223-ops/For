const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// ===================================================
// 🔧 MIDDLEWARE
// ===================================================

app.use(cors());
app.use(express.json());

// ===================================================
// 🍃 MONGODB CONNECTION
// ===================================================
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:admin123456@cluster0.xplu66f.mongodb.net/informatika",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => {
  console.log("MongoDB connected");
})
.catch(err => {
  console.error("MongoDB error:", err);
});
// ===================================================
// 📦 MONGODB MODELS
// ===================================================

const TestSchema = new mongoose.Schema({
classType:String,
question:String,
answers:[
{
text:String,
correct:Boolean
}
]
});

const TeacherSchema = new mongoose.Schema({
login:String,
password:String,
active:Boolean,
lastLogin:String
});

const Test = mongoose.model("Test",TestSchema);
const Teacher = mongoose.model("Teacher",TeacherSchema);

// ===================================================
// 📁 UPLOADS PAPKA
// ===================================================

const uploadDir = path.join(__dirname,"uploads");

if(!fs.existsSync(uploadDir)){
fs.mkdirSync(uploadDir,{recursive:true});
}

app.use("/uploads",express.static(uploadDir));

// ===================================================
// 📤 FILE UPLOAD
// ===================================================

const storage = multer.diskStorage({
destination:(req,file,cb)=>cb(null,uploadDir),
filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname)
});

const upload = multer({storage});

app.post("/api/upload",upload.single("file"),(req,res)=>{
res.json({filename:req.file.filename});
});

// ===================================================
// 📚 CLASSES (OLD JSON SYSTEM)
// ===================================================

const classesPath = path.join(__dirname,"data","classes.json");

function readClasses(){

if(!fs.existsSync(classesPath)){

const init={
kichik:{materials:[],videos:[]},
orta:{materials:[],videos:[]},
katta:{materials:[],videos:[]}
};

fs.writeFileSync(classesPath,JSON.stringify(init,null,2));
return init;
}

return JSON.parse(fs.readFileSync(classesPath,"utf-8"));
}

function writeClasses(data){
fs.writeFileSync(classesPath,JSON.stringify(data,null,2));
}

app.get("/api/classes",(req,res)=>{
res.json(readClasses());
});

app.get("/api/classes/:type",(req,res)=>{
const data=readClasses();
res.json(data[req.params.type]||{materials:[],videos:[]});
});

app.post("/api/classes/:type",(req,res)=>{

const data=readClasses();

data[req.params.type]={
materials:req.body.materials||[],
videos:req.body.videos||[]
};

writeClasses(data);

res.json({success:true});

});

app.delete("/api/classes/:type/material/:index",(req,res)=>{

const {type,index}=req.params;

const data=readClasses();

const material=data[type]?.materials?.[index];

if(!material){
return res.status(404).json({error:"Topilmadi"});
}

const filePath=path.join(uploadDir,material.file);

if(fs.existsSync(filePath)) fs.unlinkSync(filePath);

data[type].materials.splice(index,1);

writeClasses(data);

res.json({success:true});

});

app.delete("/api/classes/:type/video/:index",(req,res)=>{

const {type,index}=req.params;

const data=readClasses();

if(!data[type]?.videos?.[index]){
return res.status(404).json({error:"Topilmadi"});
}

data[type].videos.splice(index,1);

writeClasses(data);

res.json({success:true});

});

// ===================================================
// 🧪 TEST PARSER
// ===================================================

function parseTests(text){

const blocks=text.split("++++").filter(b=>b.trim());

return blocks.map(block=>{

const lines=block.trim().split("\n").filter(Boolean);

const question=lines[0];

const answers=lines.slice(1).map(line=>({

text:line.replace(/^(====|####)\s*/,""),
correct:line.startsWith("####")

}));

return {question,answers};

});

}

// ===================================================
// 💾 SAVE TESTS (MongoDB)
// ===================================================

app.post("/api/tests",async(req,res)=>{

const {classType,text}=req.body;

if(!classType||!text){
return res.status(400).json({error:"Maʼlumot yetarli emas"});
}

const tests=parseTests(text);

await Test.deleteMany({classType});

const docs=tests.map(t=>({
classType,
question:t.question,
answers:t.answers
}));

await Test.insertMany(docs);

res.json({success:true});

});

// ===================================================
// 📥 GET TESTS
// ===================================================

app.get("/api/tests/:type",async(req,res)=>{

const tests=await Test.find({classType:req.params.type});

res.json(tests);

});

// ===================================================
// 🗑 DELETE TESTS
// ===================================================

app.delete("/api/tests/:type",async(req,res)=>{

await Test.deleteMany({classType:req.params.type});

res.json({success:true});

});

// ===================================================
// 📚 RESOURCES
// ===================================================

app.use("/api/resources",require("./routes/resources.routes"));

// ===================================================
// 👨‍🏫 TEACHERS ROUTES
// ===================================================

app.use("/api/teachers",require("./routes/teachers.routes"));

// ===================================================
// 🔐 LOGIN API (MongoDB)
// ===================================================

app.post("/api/login",async(req,res)=>{

const {login,password}=req.body;

if(!login||!password){
return res.status(400).json({success:false});
}

const teacher=await Teacher.findOne({login,password});

if(!teacher){
return res.status(401).json({success:false});
}

teacher.active=true;
teacher.lastLogin=new Date().toISOString();

await teacher.save();

res.json({
success:true,
id:teacher._id
});

});

// ===================================================
// 🚀 SERVER START
// ===================================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
