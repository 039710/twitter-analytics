const router = require("express").Router();
const searchRoutes = require("./search");
const analyticRoutes = require("./analytic");
const schedulerRoutes = require("./scheduler");
router.use("/search", searchRoutes);
router.use("/analytics", analyticRoutes);
router.use("/scheduler", schedulerRoutes);
router.get("/", async (req, res) => {
  res.send("hello cuk");
});
module.exports = router;
