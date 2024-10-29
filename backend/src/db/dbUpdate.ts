import { connect, connection } from 'mongoose';
import dotenv from 'dotenv';
import { IHistory, IItem } from '../types/types';
import { Item, History, Graph } from './models/models';

// Read .env file
dotenv.config();

const dbName = process.env.DATABASE_NAME || '';
const uri = process.env.DATABASE_URL || '';
const mongoDBUri = uri.split('?')[0] + dbName + '?' + uri.split('?')[1];
