"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Get_Search extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Get_Search.hasMany(models.Tweet, {
        foreignKey: "search_id",
      });
    }
  }
  Get_Search.init(
    {
      keyword: DataTypes.STRING,
      newest_id: DataTypes.BIGINT,
      oldest_id: DataTypes.BIGINT,
      next_token: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "TW_Get_Searches",
      modelName: "Get_Search",
    }
  );
  return Get_Search;
};
