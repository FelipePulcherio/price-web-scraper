import { connect, connection } from 'mongoose';
import dotenv from 'dotenv';
import { IHistory, IItem } from '../types/types';
import { Item, History } from './models/models';

// Read .env file
dotenv.config();

const dbName = process.env.DATABASE_NAME || '';
const uri = process.env.DATABASE_URL || '';
const mongoDBUri = uri.split('?')[0] + dbName + '?' + uri.split('?')[1];

// FUNCTIONS
// Define interface for props used in readItemCollection function
interface readItemCollectionProps {
  interestFields: String | null;
}

export async function readItemCollection({
  interestFields = null,
}: readItemCollectionProps): Promise<IItem[]> {
  // Declare variable for later use
  let objectsFromItemCollection: IItem[] = [];

  // Connect to MongoDB with mongoose
  try {
    // Start connection
    await connect(mongoDBUri);
    console.log('Db_read: Connected to MongoDB.');

    // Find all objects inside Item collections that are active
    // TODO: .find() Errors are unhandled here !!!
    objectsFromItemCollection = await Item.find(
      { isActive: true },
      interestFields
    );
  } catch (err) {
    // Error handling
    console.log(`Db_read: Error connecting to the database: ${err}`);
  } finally {
    await connection.close();
    console.log('Db_read: Mongoose closed.');
  }

  return objectsFromItemCollection;
}
