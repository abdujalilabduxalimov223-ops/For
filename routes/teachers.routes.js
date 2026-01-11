const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const teachersPath = path.join(__dirname, "../data/teachers.json");

function readTeachers() {
  if (!fs.existsSync(teachersPath)) {
    fs.writeFileSync(
      teachersPath,
      JSON.stringify({ teachers: [] }, null, 2)
    );
  }
  return JSON.parse(fs.readFileSync(teachersPath, "utf-8"));
}

function writeTeachers(data) {
  fs.writeFileSync(teachersPath, JSON.stringify(data, null, 2));
}

// ===== GET ALL TEACHERS =====
router.get("/", (req, res) => {
  res.json(readTeachers().teachers);
});

// ===== ADD TEACHER =====
router.post("/", (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: "Maʼlumot yetarli emas" });
  }

  const data = readTeachers();

  if (data.teachers.find(t => t.login === login)) {
    return res.status(400).json({ error: "Login mavjud" });
  }

  data.teachers.push({
    id: Date.now(),
    login,
    password,
    active: false,
    lastLogin: null
  });

  writeTeachers(data);
  res.json({ success: true });
});

// ===== RESET PASSWORD (MUHIM!) =====
router.post("/reset/:id", (req, res) => {
  const { password } = req.body;
  const data = readTeachers();

  const teacher = data.teachers.find(
    t => t.id === Number(req.params.id)
  );

  if (!teacher) {
    return res.status(404).json({ error: "Topilmadi" });
  }

  teacher.password = password;
  writeTeachers(data);

  res.json({ success: true });
});

// ===== DELETE =====
router.delete("/:id", (req, res) => {
  const data = readTeachers();
  data.teachers = data.teachers.filter(
    t => t.id !== Number(req.params.id)
  );
  writeTeachers(data);
  res.json({ success: true });
});

module.exports = router;
