"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Tweets", {
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
          model: "Get_Searches",
          key: "id",
        },
      },
      attachments: {
        type: Sequelize.TEXT,
      },
      author_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "Authors",
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
          model: "Tweets",
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
      withheld: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Tweets");
  },
};
