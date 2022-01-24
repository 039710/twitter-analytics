const db = require("../models").sequelize;

class Controller {
  static getProject = async (req, res) => {
    const response = {
      twitter: {
        positive: [],
        negative: [],
      },
      telegram: {
        positive: [],
        negative: [],
      },
      facebook: {
        positive: [],
        negative: [],
      },
      whatsapp: {
        positive: [],
        negative: [],
      },
      beritaonline: {
        positive: [],
        negative: [],
      },
      beritaoffline: {
        positive: [],
        negative: [],
      },
    };
    res.send(response);
  };
}

module.exports = Controller;
