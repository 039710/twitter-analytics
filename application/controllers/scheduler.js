const { Scheduler } = require("../models/");
const { crawl } = require("../helpers/crawl");
const TaskManager = require("../helpers/taskManager");
const cron = require("node-cron");
class Controller {
  static async getAll(req, res) {
    try {
      const data = await Scheduler.findAll();
      data.forEach((scheduler) => {
        if (scheduler.status === "active") {
          const isFound = TaskManager.get(scheduler.keyword);
          if (!isFound) {
            const task = cron.schedule(
              `*/${scheduler.minute} * * * * `,
              async () => {
                crawl(scheduler.keyword);
              }
            );
            TaskManager.add(scheduler.keyword, task);
          } else {
            TaskManager.get(scheduler.keyword).task.start();
          }
        } else {
          const isFound = TaskManager.get(scheduler.keyword);
          if (isFound) {
            TaskManager.get(scheduler.keyword).task.stop();
          } else {
            const task = cron.schedule(
              `*/${scheduler.minute} * * * * `,
              async () => {
                crawl(scheduler.keyword);
              }
            );
            TaskManager.add(scheduler.keyword, task);
            task.stop();
          }
        }
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  static async createOne(req, res) {
    const keyword = req.body.keyword;
    const minute = req.body.minute ? req.body.minute : "1";
    if (!keyword || !minute) {
      res.status(400).json({ message: "Please fill all the required fields" });
    }
    if (minute < 60 && keyword) {
      try {
        const task = cron.schedule(`*/${minute} * * * *`, async () => {
          crawl(keyword);
        });
        TaskManager.add(keyword, task);
        const data = await Scheduler.create({ keyword, minute });
        res.status(201).json({ message: "Scheduler created", data });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
  static async editStatus(req, res) {
    const id = req.params.id;
    const status = req.body.status;
    try {
      const scheduler = await Scheduler.findOne({ where: { id } });
      if (!scheduler) {
        res.status(404).json({ message: "Scheduler not found" });
      }
      await scheduler.update({ status });
      await scheduler.save();
      const isFound = TaskManager.get(scheduler.keyword);
      if (isFound) {
        if (status === "active") {
          TaskManager.get(scheduler.keyword).task.start();
        } else {
          TaskManager.get(scheduler.keyword).task.stop();
        }
      } else {
        const task = cron.schedule(
          `*/${scheduler.minute} * * * * `,
          async () => {
            crawl(scheduler.keyword);
          }
        );
        if (status === "active") {
          TaskManager.add(scheduler.keyword, task);
          task.start();
        } else {
          TaskManager.add(scheduler.keyword, task);
          task.stop();
        }
      }

      res.status(200).json({
        message: `scheduler crawler for ${scheduler.keyword} is ${status}`,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = Controller;
