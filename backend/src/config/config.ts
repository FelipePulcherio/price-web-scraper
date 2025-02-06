import dotenv from 'dotenv';
import { ConnectOptions } from 'mongoose';
import { PrismaClient } from '@prisma/client';

// Read .env file
dotenv.config();

// Prisma Configuration
export const prisma = new PrismaClient();

// Define interface for Mongo Configuration object
interface IMongoConfig {
  MONGO_USER: string;
  MONGO_PASSWORD: string;
  MONGO_URL: string;
  MONGO_DATABASE: string;
  MONGO_URI: string;
  MONGO_CONNECT_OPTIONS: ConnectOptions;
}

const MONGO_USER: string = process.env.MONGO_USER || '';
const MONGO_PASSWORD: string = process.env.MONGO_PASSWORD || '';
const MONGO_URL: string = process.env.MONGO_URL || '';
const MONGO_DATABASE: string = process.env.MONGO_DATABASE || '';
const MONGO_CONNECT_OPTIONS: ConnectOptions = {
  retryWrites: true,
  w: 'majority',
};

export const mongoConfig: IMongoConfig = {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_URL,
  MONGO_DATABASE,
  MONGO_URI: `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_URL}/${MONGO_DATABASE}`,
  MONGO_CONNECT_OPTIONS,
};

interface IBrightConfig {
  BRIGHT_ENDPOINT: string;
}

const BRIGHT_ENDPOINT: string = process.env.BRIGHT_ENDPOINT || '';

export const brightDataConfig: IBrightConfig = {
  BRIGHT_ENDPOINT: BRIGHT_ENDPOINT,
};
