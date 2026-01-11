const fs = require("fs");
const path = require("path");

const testsPath = path.join(__dirname, "../data/tests.json");

function parseTest(text) {
  const blocks = text.split("++++").filter(b => b.trim());

  return blocks.map(block => {
    const lines = block.trim().split("\n").filter(l => l.trim());

    const question = lines[0];
    const options = [];
    let correct = "";

    lines.slice(1).forEach(line => {
      if (line.startsWith("####")) {
        correct = line.replace("####", "").trim();
        options.push(correct);
      } else if (line.startsWith("====")) {
        options.push(line.replace("====", "").trim());
      }
    });

    return { question, options, correct };
  });
}

exports.saveTest = (req, res) => {
  const { classType, text } = req.body;

  if (!classType || !text) {
    return res.status(400).json({ error: "Maʼlumot yetarli emas" });
  }

  const data = JSON.parse(fs.readFileSync(testsPath));
  data[classType] = parseTest(text);

  fs.writeFileSync(testsPath, JSON.stringify(data, null, 2));
  res.json({ success: true });
};

exports.getTests = (req, res) => {
  const data = JSON.parse(fs.readFileSync(testsPath));
  res.json(data[req.params.type] || []);
};

exports.deleteTests = (req, res) => {
  const data = JSON.parse(fs.readFileSync(testsPath));
  data[req.params.type] = [];
  fs.writeFileSync(testsPath, JSON.stringify(data, null, 2));
  res.json({ success: true });
};
