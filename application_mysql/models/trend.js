"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Trend extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Trend.init(
    {
      name: DataTypes.STRING,
      url: DataTypes.STRING,
      tweet_volume: DataTypes.INTEGER,
    },
    {
      sequelize,
      charset: "latin1",
      collate: "latin1_swedish_ci",
      tableName: "TW_Trends",
      modelName: "Trend",
    }
  );
  return Trend;
};
