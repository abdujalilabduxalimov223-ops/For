const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/classes.json");


function readData(){

 if(!fs.existsSync(filePath)){
  fs.writeFileSync(filePath, JSON.stringify({},null,2));
 }

 return JSON.parse(fs.readFileSync(filePath,"utf-8"));

}


function writeData(data){
 fs.writeFileSync(filePath, JSON.stringify(data,null,2));
}



exports.getClassData = (req,res)=>{

 try{

  const {classType} = req.params;

  const data = readData();

  res.json(data[classType] || {});

 }catch(err){

  res.status(500).json({error:"Server xatosi"});

 }

};



exports.addClassData = (req,res)=>{

 try{

  const {classType} = req.params;

  const newData = req.body;

  const data = readData();

  data[classType] = {
   ...data[classType],
   ...newData
  };

  writeData(data);

  res.json({success:true});

 }catch(err){

  res.status(500).json({error:"Saqlashda xato"});

 }

};
