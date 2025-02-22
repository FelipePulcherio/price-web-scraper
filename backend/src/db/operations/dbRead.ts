import { mongoConfig } from '../../config/config';
import { connect, connection, ObjectId, Types, FilterQuery } from 'mongoose';
import { IHistory, IItem } from '../../types/types';
import { Item, History } from '../models/models';

// FUNCTIONS
// Define interface for props used in readItemCollection function
interface readItemCollectionProps {
  interestFields?: string | null;
}

export async function readItemCollection({
  interestFields = null,
}: readItemCollectionProps): Promise<IItem[]> {
  // Declare variable for later use
  let objectsFromItemCollection: IItem[] = [];

  // Connect to MongoDB with mongoose
  try {
    // Start connection
    await connect(mongoConfig.MONGO_URI, mongoConfig.MONGO_CONNECT_OPTIONS);
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

// Define interface for props used in readHistoryCollection function
interface readHistoryCollectionProps {
  searchParams: FilterQuery<IHistory>;
  interestFields?: String | null;
}

export async function readHistoryCollection({
  searchParams,
  interestFields = null,
}: readHistoryCollectionProps): Promise<IHistory[]> {
  // Declare variable for later use
  let objectsFromHistoryCollection: IHistory[] = [];

  // Connect to MongoDB with mongoose
  try {
    // Start connection
    await connect(mongoConfig.MONGO_URI, mongoConfig.MONGO_CONNECT_OPTIONS);
    console.log('Db_read: Connected to MongoDB.');

    // Find all objects inside Item collections that are active
    objectsFromHistoryCollection = await History.find(
      searchParams,
      interestFields
    );
    // .find() Errors are unhandled here !!!
  } catch (err) {
    // Error handling
    console.log(`Db_read: Error connecting to the database: ${err}`);
  } finally {
    await connection.close();
    console.log('Db_read: Mongoose closed.');
  }

  // console.log(objectsFromHistoryCollection);

  return objectsFromHistoryCollection;
}

async function testItemRead() {
  const test = await readItemCollection({
    interestFields: '_id stores isActive lowestPrice',
  });
  console.log(test);
}

async function testHistoryRead() {
  const listOfIds: Types.ObjectId[] = [
    new Types.ObjectId('67227ed8a47e7d929cd3d214'),
    new Types.ObjectId('67227ed8a47e7d929cd3d213'),
  ];

  const test = await readHistoryCollection({
    searchParams: {
      item_id: { $in: listOfIds },
    },
  });
  console.log(test);
}

// testItemRead();
// testHistoryRead();
