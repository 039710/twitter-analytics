const router = require("express").Router();
const searchRoutes = require("./search");
const analyticsRoutes = require("./analytics");
router.use("/search", searchRoutes);
router.use("/analytics", analyticsRoutes);
router.get("/", async (req, res) => {
  res.send("hello cuk");
});
module.exports = router;
