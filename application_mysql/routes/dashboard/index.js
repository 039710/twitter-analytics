const router = require("express").Router();
const controller = require("../../controllers/dashboard");
router.get("/", controller.getDashboardByKeyword);
router.get("/twitter", controller.getDashboardTwitter);
router.get("/whatsapp", controller.getDashboardWhatsapp);
router.get("/telegram", controller.getDashboardTelegram);
router.get("/facebook", controller.getDashboardFacebook);
router.get("/online-news", controller.getDashboardOnlineNews);
router.get("/offline-news", controller.getDashboardOflineNews);
router.get("/memory-space", controller.getDashboardMemorySpace);

module.exports = router;
