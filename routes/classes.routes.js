import express from "express";
import fs from "fs";
import path from "path";
import classes from "../data/classes.json" assert { type: "json" };

const router = express.Router();

const DATA_PATH = path.resolve("backend/data/classes.json");
const UPLOADS_PATH = path.resolve("backend/uploads");

// GET
router.get("/:type", (req, res) => {
  const { type } = req.params;
  res.json(classes[type]);
});

// DELETE MATERIAL
router.delete("/:type/material/:index", (req, res) => {
  const { type, index } = req.params;

  const item = classes[type].materials[index];
  if (!item) return res.status(404).json({ error: "Not found" });

  const filePath = path.join(UPLOADS_PATH, item.file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  classes[type].materials.splice(index, 1);
  fs.writeFileSync(DATA_PATH, JSON.stringify(classes, null, 2));

  res.json({ success: true });
});

// DELETE VIDEO
router.delete("/:type/video/:index", (req, res) => {
  const { type, index } = req.params;

  classes[type].videos.splice(index, 1);
  fs.writeFileSync(DATA_PATH, JSON.stringify(classes, null, 2));

  res.json({ success: true });
});

export default router;
