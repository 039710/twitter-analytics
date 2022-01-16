const router = require("express").Router();
const controller = require("../../controllers/search");
router.get("/trend", controller.getTrend);
router.get("/first-tweet", controller.firstTweetByKeyword);
router.get("/last-tweet", controller.lastTweetByKeyword);
router.get("/duration", controller.durationTrend);
module.exports = router;
