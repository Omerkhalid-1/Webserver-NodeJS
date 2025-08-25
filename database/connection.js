const { Sequelize } = require('sequelize');
require('dotenv').config({ quiet: true });

// Create Sequelize instance
const sequelize = new Sequelize(
  //database credentials
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {

    host: process.env.DB_HOST,// db server location
    port: process.env.DB_PORT,// port 
    dialect: 'postgres', // tells database type 
    logging: false,

    //logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// Test connection function
async function testConnection() {
  try {
    await sequelize.authenticate();// test connection by trying to connect
    console.log('PostgreSQL connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error.message);
    return false;
  }
}

// Sync database function
async function syncDatabase(options = {}) {
  try {
    await sequelize.sync(options); // sync all defined models to db. 
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database synchronization failed:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};