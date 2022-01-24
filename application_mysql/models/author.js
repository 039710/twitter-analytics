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
      username: DataTypes.STRING,
      location: DataTypes.STRING,
      verified: DataTypes.BOOLEAN,
      protected: DataTypes.BOOLEAN,
      created_at: DataTypes.DATE,
      profile_image_url: DataTypes.STRING,
      tweet: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      sequelize,
      tableName: "TW_Authors",
      modelName: "Author",
    }
  );
  return Author;
};
