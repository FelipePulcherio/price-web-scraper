import { connect, connection, AnyBulkWriteOperation, Types } from 'mongoose';
import { mongoConfig } from '../config/config';
import {
  IHistory,
  IItem,
  IShortItem,
  IScraperResult,
  IGraphResult,
  IGraph,
} from '../types/types';
import { Item, History, Graph } from './models/models';

// FUNCTIONS
// Define interface for props used in updateHistoryCollection function
interface updateHistoryCollectionProps {
  listOfSuccessObj: IShortItem[];
  retryCount?: number;
}

export async function updateHistoryCollection({
  listOfSuccessObj,
  retryCount = 3,
}: updateHistoryCollectionProps) {
  // Connect to MongoDB with mongoose
  try {
    // Start connection
    await connect(mongoConfig.MONGO_URI, mongoConfig.MONGO_CONNECT_OPTIONS);
    console.log('Db_update: Connected to MongoDB.');

    // Declare bulkOperations array
    const bulkOperations: AnyBulkWriteOperation[] = [];

    // Iterate over listOfSuccessObj and create a new Entry for each one
    listOfSuccessObj.forEach(async (shortItem) => {
      const newEntry: IScraperResult = {
        store: shortItem.storeName,
        price: shortItem.price,
        date: shortItem.lastUpdated,
        moment: shortItem.lastUpdated.getHours() < 22 ? 'Morning' : 'Evening',
      };

      // Prepare update operation for each item
      bulkOperations.push({
        updateOne: {
          filter: { item_id: shortItem._id },
          update: { $push: { dataFull: newEntry } },
        },
      });
    });

    try {
      // Execute bulk update operation
      await History.bulkWrite(bulkOperations);

      console.log('Db_update: History update success!\nUpdated IDs:');
      // listOfSuccessObj.forEach((item) => console.log(item._id));
      //
    } catch (error) {
      console.error(
        `Db_update: Error executing bulk write operation in History: ${error}`
      );

      // Check if it's possible to try again.
      if (retryCount > 0) {
        console.log(
          `Db_update: Retrying update operation.\nRetries left: ${retryCount}`
        );

        // Retry the operation recursively with decremented retryCount
        await updateHistoryCollection({
          listOfSuccessObj,
          retryCount: retryCount - 1,
        });
      } else {
        console.error('Db_update: Retry limit reached. Operation failed.');
        // Need more error Handling here! (Logging)
      }
    }
  } catch (err) {
    // Error handling related to connection
    console.log(`Db_update: Error connecting to the database: ${err}`);
  } finally {
    await connection.close();
    console.log('Db_update: Mongoose closed.');
  }
}

// Define interface for props used in updateGraphCollection function
interface updateGraphCollectionProps {
  updatedItem: IItem[];
  retryCount?: number;
}

export async function updateGraphCollection({
  updatedItem,
  retryCount = 3,
}: updateGraphCollectionProps) {
  // Connect to MongoDB with mongoose
  try {
    // Start connection
    await connect(mongoConfig.MONGO_URI, mongoConfig.MONGO_CONNECT_OPTIONS);
    console.log('Db_update: Connected to MongoDB.');

    // Declare bulkOperations array
    const bulkOperations: AnyBulkWriteOperation[] = [];

    // Iterate over updatedItem and create a new Entry for each one
    updatedItem.forEach(async (item) => {
      const newEntry: IGraphResult = {
        lowestPrice: item.lowestPrice,
        lowestStore: item.lowestStore,
        date: item.lastUpdated,
      };

      // Prepare update operation for each item
      bulkOperations.push({
        updateOne: {
          filter: { item_id: item._id },
          update: { $push: { data365: newEntry } },
        },
      });
    });

    try {
      // Execute bulk update operation
      await Graph.bulkWrite(bulkOperations);

      console.log('Db_update: Graph update success!');
      // updatedItem.forEach((item) => console.log(item._id));
      //
    } catch (error) {
      console.error(
        `Db_update: Error executing bulk write operation in Graph: ${error}`
      );

      // Check if it's possible to try again.
      if (retryCount > 0) {
        console.log(
          `Db_update: Retrying update operation.\nRetries left: ${retryCount}`
        );

        // Retry the operation recursively with decremented retryCount
        await updateGraphCollection({
          updatedItem: updatedItem,
          retryCount: retryCount - 1,
        });
      } else {
        console.error('Db_update: Retry limit reached. Operation failed.');
        // Need more error Handling here! (Logging)
      }
    }
  } catch (err) {
    // Error handling related to connection
    console.log(`Db_update: Error connecting to the database: ${err}`);
  } finally {
    await connection.close();
    console.log('Db_update: Mongoose closed.');
  }
}

async function testUpdateHistoryCollection() {
  const listOfShortItems: IShortItem[] = [
    {
      _id: new Types.ObjectId('67227ed8a47e7d929cd3d213'),
      url: 'https://www.walmart.ca/en/ip/Samsung-65-QLED-SMART-4K-TV-Q60D-Series/6000207606889?selectedSellerId=1&from=/search',
      price: 990,
      lastUpdated: new Date(),
      status: 'OK',
      storeName: 'walmart.ca',
    },
  ];

  const test = await updateHistoryCollection({
    listOfSuccessObj: listOfShortItems,
  });
}

async function testUpdateGraphCollection() {
  const updatedItem: IItem[] = [
    {
      _id: new Types.ObjectId('67227ed8a47e7d929cd3d213'),
      lastUpdated: new Date('2024-10-31T03:20:05.842+00:00'),
      lowestPrice: 990,
      stores: [{ name: '', logo: '', url: '' }],
      lowestStore: 'walmart.ca',
    },
  ];

  const test = await updateGraphCollection({ updatedItem: updatedItem });
}

// testUpdateHistoryCollection();
// testUpdateGraphCollection();
