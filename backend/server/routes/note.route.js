const express = require("express");
const router = express.Router();
const noteController = require("../controllers/note.controller");

router.post("/", noteController.create);
router.get("/:userId", noteController.getAll);
router.put("/:id", noteController.update);

module.exports = router;
