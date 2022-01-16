require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const router = require("./routes/index");
const job = require("./helpers/cronTask");
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router);
app.listen(port, () => {
  job.start();
  console.log(`Tweet-Service listening at ${port}`);
});
