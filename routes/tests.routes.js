const express = require("express");
const router = express.Router();
const {
  saveTest,
  getTests,
  deleteTests
} = require("../controllers/tests.controller");

router.post("/", saveTest);
router.get("/:type", getTests);
router.delete("/:type", deleteTests);

module.exports = router;
