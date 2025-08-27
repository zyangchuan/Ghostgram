const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, 
  process.env.MYSQL_DATABASE_USER, 
  process.env.MYSQL_ROOT_PASSWORD, 
  {
    host: process.env.MYSQL_DATABASE_HOST,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;