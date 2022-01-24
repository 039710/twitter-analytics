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
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      hooks: {
        beforeCreate: (scheduler) => {
          scheduler.status = "active";
        },
      },
      sequelize,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "TW_Schedulers",
      modelName: "Scheduler",
    }
  );
  return Scheduler;
};
