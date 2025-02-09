import dotenv from 'dotenv';

// Code based on: https://github.com/santiq/bulletproof-nodejs/
// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Read .env file
const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process
  throw new Error("Couldn't find .env file");
}

export default {
  // Port
  port: parseInt(process.env.PORT ?? '3000', 10),

  // MongoDB Atlas
  mongoUri: process.env.MONGODB_URI,

  // PostgreSQL
  postgresUrl: process.env.DATABASE_URL,

  // BrighData
  brightData: process.env.BRIGHTDATA_ENDPOINT,

  // Agenda.js
  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
  },

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO,

  // API
  api: {
    prefix: '/api/v1',
  },
};
