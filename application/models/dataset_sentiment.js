'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dataset_Sentiment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Dataset_Sentiment.init({
    text: DataTypes.STRING,
    sentiment: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Dataset_Sentiment',
  });
  return Dataset_Sentiment;
};