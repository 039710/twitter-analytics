const router = require("express").Router();
const controller = require("../../controllers/project");
router.get("/:id", controller.getProject);
module.exports = router;
