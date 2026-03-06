const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/resources.json");


function readData() {

  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
  }

  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));

}


function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}


// GET
exports.getResources = (req, res) => {

  const data = readData();
  res.json(data);

};


// ADD
exports.addResource = (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "Fayl yuklanmadi" });
  }

  let resources = readData();

  if (!Array.isArray(resources)) {
    resources = [];
  }

  resources.push({
    id: Date.now(),
    title: req.body.title,
    category: req.body.category,
    filename: req.file.filename,
    folder: req.body.category,
    size: (req.file.size / 1024 / 1024).toFixed(2) + " MB",
    type: path.extname(req.file.originalname)
      .substring(1)
      .toUpperCase()
  });

  writeData(resources);

  res.json({ success: true });

};


// DELETE
exports.deleteResource = (req, res) => {

  let resources = readData();

  const file = resources.find(r => r.id == req.params.id);

  if (file) {

    const filePath = path.join(
      __dirname,
      "../uploads",
      file.folder,
      file.filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

  }

  resources = resources.filter(r => r.id != req.params.id);

  writeData(resources);

  res.json({ success: true });

};
