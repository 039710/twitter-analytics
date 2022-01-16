const router = require("express").Router();
const controller = require("../../controllers/search");
router.get("/get-searches", controller.getSearchesByKeyword);
router.get("/tweets", controller.getTweetsByKeyword);
router.get("/", controller.getAllSearches);
module.exports = router;
