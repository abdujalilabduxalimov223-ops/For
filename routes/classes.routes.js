const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATA_PATH = path.join(__dirname, "../data/classes.json");
const UPLOADS_PATH = path.join(__dirname, "../uploads");

function readClasses() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function writeClasses(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}


// ===== GET =====
router.get("/:type", (req, res) => {

  const classes = readClasses();
  const { type } = req.params;

  res.json(classes[type] || {});

});


// ===== DELETE MATERIAL =====
router.delete("/:type/material/:index", (req, res) => {

  const { type, index } = req.params;

  const classes = readClasses();

  const item = classes[type].materials[index];

  if (!item) {
    return res.status(404).json({ error: "Not found" });
  }

  const filePath = path.join(UPLOADS_PATH, item.file);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  classes[type].materials.splice(index, 1);

  writeClasses(classes);

  res.json({ success: true });

});


// ===== DELETE VIDEO =====
router.delete("/:type/video/:index", (req, res) => {

  const { type, index } = req.params;

  const classes = readClasses();

  classes[type].videos.splice(index, 1);

  writeClasses(classes);

  res.json({ success: true });

});


module.exports = router;
