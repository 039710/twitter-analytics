"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Scheduler extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Scheduler.init(
    {
      keyword: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "keyword is already exist",
        },
      },
      status: DataTypes.STRING,
      max_result: DataTypes.INTEGER,
      minute: DataTypes.INTEGER,
    },
    {
      hooks: {
        beforeCreate: (scheduler) => {
          scheduler.status = "active";
        },
      },
      sequelize,
      charset: "latin1",
      collate: "latin1_swedish_ci",
      tableName: "TW_Schedulers",
      modelName: "Scheduler",
    }
  );
  return Scheduler;
};
