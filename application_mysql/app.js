require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const router = require("./routes/index");
const TaskManager = require("./helpers/taskManager");
const { crawlTrend } = require("./helpers/crawl");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(router);
app.listen(port, () => {
  TaskManager.initiateServer();
  crawlTrend.start();
  console.log(`Tweet-Service listening at ${port}`);
});
