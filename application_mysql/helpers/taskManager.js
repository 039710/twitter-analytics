const tasks = [];
const { Scheduler } = require("../models");
const { crawl } = require("../helpers/crawl");
const add = (keyword, task) => {
  tasks.push({ keyword, task });
};
const cron = require("node-cron");
const get = (keyword) => {
  return tasks.find((task) => task.keyword === keyword);
};

const initiateServer = async () => {
  const schedulers = await Scheduler.findAll();
  let seconds = 1;
  schedulers.forEach((scheduler) => {
    if (scheduler.status === "active") {
      const isFound = get(scheduler.keyword);
      if (!isFound) {
        const task = cron.schedule(
          `${seconds} */${scheduler.minute} * * * *`,
          async () => {
            crawl(scheduler.keyword, scheduler.max_result);
          }
        );
        console.log("creating task every", scheduler.minute, "minutes");
        add(scheduler.keyword, task);
        task.start();
      } else {
        get(scheduler.keyword).task.start();
      }
    } else {
      const isFound = get(scheduler.keyword);
      if (isFound) {
        get(scheduler.keyword).task.stop();
      } else {
        console.log("creating task");
        const task = cron.schedule(
          `${seconds} */${scheduler.minute} * * * *`,
          async () => {
            crawl(scheduler.keyword, scheduler.max_result);
          }
        );
        add(scheduler.keyword, task);
        task.stop();
      }
    }
    seconds += 8;
  });
};
module.exports = {
  add,
  get,
  initiateServer,
  tasks,
};
