"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("TW_Get_Searches", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      keyword: {
        type: Sequelize.STRING,
      },
      newest_id: {
        type: Sequelize.BIGINT,
      },
      oldest_id: {
        type: Sequelize.BIGINT,
      },
      next_token: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("TW_Get_Searches");
  },
};
