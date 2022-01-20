const router = require("express").Router();
const Controller = require("../../controllers/scheduler");

router.post("/create", Controller.createOne);
router.put("/edit/:id", Controller.editStatus);
router.get("/", Controller.getAll);
module.exports = router;
