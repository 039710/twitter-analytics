"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tweet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tweet.belongsTo(models.Get_Search, {
        foreignKey: "search_id",
      });
      Tweet.belongsTo(models.Author, {
        foreignKey: "author_id",
      });
      Tweet.belongsTo(models.Tweet, {
        foreignKey: "conversation_id",
        as: "conversation",
      });
    }
  }
  Tweet.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: {
          args: true,
          msg: "The id must be unique",
        },
        validate: {
          unique: {
            args: true,
            msg: "The id must be unique",
          },
        },
      },
      keyword_used: DataTypes.STRING,
      search_id: DataTypes.BIGINT,
      attachments: DataTypes.TEXT,
      author_id: DataTypes.BIGINT,
      context_annotations: DataTypes.TEXT,
      conversation_id: DataTypes.BIGINT,
      created_time: DataTypes.TEXT,
      entities: DataTypes.TEXT,
      geo: DataTypes.TEXT,
      in_reply_to_user_id: DataTypes.BIGINT,
      lang: DataTypes.TEXT,
      public_metrics: DataTypes.TEXT,
      possibly_sensitive: DataTypes.BOOLEAN,
      referenced_tweets: DataTypes.TEXT,
      reply_settings: DataTypes.TEXT,
      source: DataTypes.TEXT,
      text: DataTypes.TEXT,
      withheld: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Tweet",
    }
  );
  return Tweet;
};
