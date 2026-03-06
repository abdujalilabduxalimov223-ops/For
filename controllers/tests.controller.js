const fs = require("fs");
const path = require("path");

const testsPath = path.join(__dirname, "../data/tests.json");


// ===== FILE O'QISH =====
function readTests() {

  if (!fs.existsSync(testsPath)) {
    fs.writeFileSync(testsPath, JSON.stringify({}, null, 2));
  }

  return JSON.parse(fs.readFileSync(testsPath, "utf-8"));
}


// ===== FILE YOZISH =====
function writeTests(data) {
  fs.writeFileSync(testsPath, JSON.stringify(data, null, 2));
}


// ===== TEST PARSER =====
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

    return {
      question,
      options,
      correct
    };

  });

}


// ===== SAVE TEST =====
exports.saveTest = (req, res) => {

  try {

    const { classType, text } = req.body;

    if (!classType || !text) {
      return res.status(400).json({ error: "Maʼlumot yetarli emas" });
    }

    const data = readTests();

    data[classType] = parseTest(text);

    writeTests(data);

    res.json({ success: true });

  } catch (err) {

    res.status(500).json({ error: "Test saqlashda xato" });

  }

};


// ===== GET TEST =====
exports.getTests = (req, res) => {

  try {

    const data = readTests();

    res.json(data[req.params.type] || []);

  } catch (err) {

    res.status(500).json({ error: "Testlarni olishda xato" });

  }

};


// ===== DELETE TEST =====
exports.deleteTests = (req, res) => {

  try {

    const data = readTests();

    data[req.params.type] = [];

    writeTests(data);

    res.json({ success: true });

  } catch (err) {

    res.status(500).json({ error: "Testlarni o‘chirishda xato" });

  }

};
