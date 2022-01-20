"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Author.hasMany(models.Tweet, {
        foreignKey: "author_id",
      });
    }
  }
  Author.init(
    {
      url: DataTypes.STRING,
      description: DataTypes.TEXT,
      public_metrics: DataTypes.TEXT,
      name: DataTypes.STRING,
      location: DataTypes.STRING,
      verified: DataTypes.BOOLEAN,
      protected: DataTypes.BOOLEAN,
      created_at: DataTypes.DATE,
      profile_image_url: DataTypes.STRING,
      tweet: DataTypes.TEXT,
    },
    {
      sequelize,
      charset: "latin1",
      collate: "latin1_swedish_ci",
      tableName: "TW_Authors",
      modelName: "Author",
    }
  );
  return Author;
};
