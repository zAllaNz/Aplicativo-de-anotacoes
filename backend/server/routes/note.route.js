const express = require("express");
const router = express.Router();
const noteController = require("../controllers/note.controller");

router.post("/", noteController.create);
router.get("/:userId", noteController.getAll);
router.put("/:id", noteController.update);
router.put("/delete/:id", noteController.delete);
router.put("/restore/:id", noteController.restore);
router.delete("/delete/:id/permanent", noteController.deletePermanent);

module.exports = router;
