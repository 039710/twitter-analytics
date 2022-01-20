"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Authors", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      url: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      public_metrics: {
        type: Sequelize.TEXT,
      },
      name: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      verified: {
        type: Sequelize.BOOLEAN,
      },
      protected: {
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      profile_image_url: {
        type: Sequelize.STRING,
      },
      tweet: {
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
    await queryInterface.dropTable("Authors");
  },
};
