const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");


// ===== GET ALL TEACHERS =====
router.get("/", async (req,res)=>{
 const teachers = await Teacher.find();
 res.json(teachers);
});


// ===== ADD TEACHER =====
router.post("/", async (req,res)=>{

 const {login,password} = req.body;

 if(!login || !password){
  return res.status(400).json({error:"Ma'lumot yetarli emas"});
 }

 const exists = await Teacher.findOne({login});

 if(exists){
  return res.status(400).json({error:"Login mavjud"});
 }

 const teacher = new Teacher({
  login,
  password,
  active:false,
  lastLogin:null
 });

 await teacher.save();

 res.json({success:true});

});


// ===== RESET PASSWORD =====
router.post("/reset/:id", async (req,res)=>{

 const {password} = req.body;

 const teacher = await Teacher.findById(req.params.id);

 if(!teacher){
  return res.status(404).json({error:"Topilmadi"});
 }

 teacher.password = password;

 await teacher.save();

 res.json({success:true});

});


// ===== DELETE =====
router.delete("/:id", async (req,res)=>{

 await Teacher.findByIdAndDelete(req.params.id);

 res.json({success:true});

});


module.exports = router;
