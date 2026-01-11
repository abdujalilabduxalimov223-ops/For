const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = 5000;

// ===================================================
// 🔧 MIDDLEWARE
// ===================================================
app.use(cors());
app.use(express.json());

// ===================================================
// 📁 UPLOADS PAPKA (STATIC)
// ===================================================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// ===================================================
// 📤 FILE UPLOAD (DASHBOARD UCHUN)
// ===================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ filename: req.file.filename });
});

// ===================================================
// 📚 CLASSES (KICHIK / ORTA / KATTA) — DASHBOARDGA MOS
// ===================================================
const classesPath = path.join(__dirname, "data", "classes.json");

// agar fayl bo‘lmasa — yaratib qo‘yamiz
function readClasses() {
  if (!fs.existsSync(classesPath)) {
    const init = {
      kichik: { materials: [], videos: [] },
      orta: { materials: [], videos: [] },
      katta: { materials: [], videos: [] }
    };
    fs.writeFileSync(classesPath, JSON.stringify(init, null, 2));
    return init;
  }
  return JSON.parse(fs.readFileSync(classesPath, "utf-8"));
}

function writeClasses(data) {
  fs.writeFileSync(classesPath, JSON.stringify(data, null, 2));
}

// ⚠️ DASHBOARD SAHIFA OCHILGANDA SHUNI CHAQRADI
app.get("/api/classes", (req, res) => {
  res.json(readClasses());
});

// GET CLASS DATA
app.get("/api/classes/:type", (req, res) => {
  const data = readClasses();
  res.json(data[req.params.type] || { materials: [], videos: [] });
});

// SAVE CLASS DATA (material + video)
app.post("/api/classes/:type", (req, res) => {
  const data = readClasses();

  data[req.params.type] = {
    materials: req.body.materials || [],
    videos: req.body.videos || []
  };

  writeClasses(data);
  res.json({ success: true });
});

// DELETE MATERIAL
app.delete("/api/classes/:type/material/:index", (req, res) => {
  const { type, index } = req.params;
  const data = readClasses();

  const material = data[type]?.materials?.[index];
  if (!material) {
    return res.status(404).json({ error: "Topilmadi" });
  }

  const filePath = path.join(uploadDir, material.file);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  data[type].materials.splice(index, 1);
  writeClasses(data);

  res.json({ success: true });
});

// DELETE VIDEO
app.delete("/api/classes/:type/video/:index", (req, res) => {
  const { type, index } = req.params;
  const data = readClasses();

  if (!data[type]?.videos?.[index]) {
    return res.status(404).json({ error: "Topilmadi" });
  }

  data[type].videos.splice(index, 1);
  writeClasses(data);

  res.json({ success: true });
});

// ===================================================
// 🧪 TESTLAR BACKEND (ESKI FRONTENDGA MOS)
// ===================================================
const testsPath = path.join(__dirname, "data", "tests.json");

if (!fs.existsSync(testsPath)) {
  fs.writeFileSync(
    testsPath,
    JSON.stringify({ kichik: [], orta: [], katta: [] }, null, 2)
  );
}

function parseTests(text) {
  const blocks = text.split("++++").filter(b => b.trim());

  return blocks.map(block => {
    const lines = block.trim().split("\n").filter(Boolean);
    const question = lines[0];

    const answers = lines.slice(1).map(line => ({
      text: line.replace(/^(====|####)\s*/, ""),
      correct: line.startsWith("####")
    }));

    return { question, answers };
  });
}

// SAVE TESTS
app.post("/api/tests", (req, res) => {
  const { classType, text } = req.body;
  if (!classType || !text) {
    return res.status(400).json({ error: "Maʼlumot yetarli emas" });
  }

  const data = JSON.parse(fs.readFileSync(testsPath, "utf-8"));
  data[classType] = parseTests(text);

  fs.writeFileSync(testsPath, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// GET TESTS
app.get("/api/tests/:type", (req, res) => {
  const data = JSON.parse(fs.readFileSync(testsPath, "utf-8"));
  res.json(data[req.params.type] || []);
});

// DELETE ALL TESTS
app.delete("/api/tests/:type", (req, res) => {
  const data = JSON.parse(fs.readFileSync(testsPath, "utf-8"));
  data[req.params.type] = [];
  fs.writeFileSync(testsPath, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// ===================================================
// 📚 RESOURCES (OLDINGI ISHLAYOTGAN QISM — TEGILMADI)
// ===================================================
app.use("/api/resources", require("./routes/resources.routes"));

// ===================================================
// 🚀 SERVER START
// ===================================================
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
// ================= TEACHERS =================
app.use("/api/teachers", require("./routes/teachers.routes"));

// ===================================================
// 🔐 LOGIN API
// ===================================================
app.post("/api/login", (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ success: false });
  }

  const teachersPath = path.join(__dirname, "data", "teachers.json");
  const data = JSON.parse(fs.readFileSync(teachersPath, "utf-8"));

  const teacher = data.teachers.find(
    t => t.login === login && t.password === password
  );

  if (!teacher) {
    return res.status(401).json({ success: false });
  }

  // status va oxirgi kirish
  teacher.active = true;
  teacher.lastLogin = new Date().toISOString();

  fs.writeFileSync(teachersPath, JSON.stringify(data, null, 2));

  res.json({
    success: true,
    id: teacher.id
  });
});

