const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/classes.json");

function readData() {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

exports.getClassData = (req, res) => {
  const { classType } = req.params;
  const data = readData();

  res.json(data[classType] || {});
};

exports.addClassData = (req, res) => {
  const { classType } = req.params;
  const newData = req.body;

  const data = readData();
  data[classType] = newData;

  writeData(data);

  res.json({ success: true });
};
