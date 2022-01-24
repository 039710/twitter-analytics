"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("TW_Tweets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        unique: {
          args: true,
          msg: "The id must be unique",
        },
      },
      keyword_used: {
        type: Sequelize.STRING,
      },
      search_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "TW_Get_Searches",
          key: "id",
        },
      },
      attachments: {
        type: Sequelize.TEXT,
      },
      author_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "TW_Authors",
          key: "id",
        },
      },
      context_annotations: {
        type: Sequelize.TEXT,
      },
      conversation_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "TW_Tweets",
          key: "id",
        },
      },
      created_time: {
        type: Sequelize.TEXT,
      },
      entities: {
        type: Sequelize.TEXT,
      },
      geo: {
        type: Sequelize.TEXT,
      },
      in_reply_to_user_id: {
        type: Sequelize.BIGINT,
      },
      lang: {
        type: Sequelize.TEXT,
      },
      public_metrics: {
        type: Sequelize.TEXT,
      },
      possibly_sensitive: {
        type: Sequelize.BOOLEAN,
      },
      referenced_tweets: {
        type: Sequelize.TEXT,
      },
      reply_settings: {
        type: Sequelize.TEXT,
      },
      source: {
        type: Sequelize.TEXT,
      },
      text: {
        type: Sequelize.TEXT,
      },
      sentiment: {
        type: Sequelize.STRING,
      },
      withheld: {
        type: Sequelize.TEXT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("TW_Tweets");
  },
};
