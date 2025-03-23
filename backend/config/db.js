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

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST, // e.g., sql201.byetcluster.com
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 20000, // 20 seconds
      ssl: {
        require: true,         // if SSL is required by your provider
        rejectUnauthorized: false,
      },
    },
    logging: console.log,
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('MySQL connection established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to MySQL:', err);
  });

module.exports = sequelize;
