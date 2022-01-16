const tasks = [];

const add = (keyword, task) => {
  tasks.push({ keyword, task });
};

const get = (keyword) => {
  return tasks.find((task) => task.keyword === keyword);
};

module.exports = {
  add,
  get,
};
