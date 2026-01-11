const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const controller = require("../controllers/resources.controller");

router.get("/", controller.getResources);
router.post("/", upload.single("file"), controller.addResource);
router.delete("/:id", controller.deleteResource);

module.exports = router;
