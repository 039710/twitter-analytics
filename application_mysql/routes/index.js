const router = require("express").Router();
const searchRoutes = require("./search");
const analyticRoutes = require("./analytic");
const schedulerRoutes = require("./scheduler");
const dashboardRoutes = require("./dashboard");
const projectRoutes = require("./project");

router.use("/search", searchRoutes);
router.use("/analytics", analyticRoutes);
router.use("/scheduler", schedulerRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/project", projectRoutes);

module.exports = router;
