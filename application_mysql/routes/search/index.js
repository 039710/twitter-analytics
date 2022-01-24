const router = require("express").Router();
const controller = require("../../controllers/search");
router.get("/get-searches", controller.getSearchesByKeyword);
router.get("/tweets", controller.getTweetsByKeyword);
router.get("/multiple-id", controller.getMultipleId);
router.get("/", controller.getAllSearches);
module.exports = router;
