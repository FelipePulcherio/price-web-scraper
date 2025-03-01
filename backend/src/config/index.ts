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

function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export default {
  // Port
  port: parseInt(getEnvVariable('PORT'), 10),

  // MongoDB Atlas
  mongoUri: getEnvVariable('MONGODB_URI'),

  // PostgreSQL
  postgresUrl: getEnvVariable('DATABASE_URL'),

  // BrighData
  brightData: getEnvVariable('BRIGHTDATA_ENDPOINT'),

  // Agenda.js
  agenda: {
    dbCollection: getEnvVariable('AGENDA_DB_COLLECTION'),
  },

  // Cloudinary
  cloudinary: {
    cloudName: getEnvVariable('CLOUDINARY_NAME'),
    key: getEnvVariable('CLOUDINARY_KEY'),
    secret: getEnvVariable('CLOUDINARY_SECRET'),
  },

  // JWT
  jwt: {
    secret: getEnvVariable('JWT_SECRET'),
    algorithm: getEnvVariable('JWT_ALGO'),
    maxAge: parseInt(getEnvVariable('JWT_MAX_AGE'), 10),
  },

  // API
  api: {
    prefix: '/api/v1',
  },
};
