const { Sequelize } = require('sequelize');
require('dotenv').config();

/// Load variables from .env file
const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT
} = process.env;

// Create a new Sequelize instance
const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST || 'localhost',
  port: MYSQL_PORT || 3306,
  dialect: 'mysql',
  logging: false, // set to console.log to see SQL queries
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('MySQL connection established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to MySQL:', err);
  });

module.exports = sequelize;
