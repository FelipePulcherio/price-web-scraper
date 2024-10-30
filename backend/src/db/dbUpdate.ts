import { connect, connection, AnyBulkWriteOperation } from 'mongoose';
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

async function updateHistoryCollection({
  listOfSuccessObj,
  retryCount = 3,
}: updateHistoryCollectionProps) {
  // Accept array in format: [ { _id: , url: , price: , lastUpdated: , status: , store: } ]

  // Connect to MongoDB with mongoose
  try {
    // Start connection
    await connect(mongoConfig.MONGO_URI, mongoConfig.MONGO_CONNECT_OPTIONS);
    console.log('Db_update: Connected to MongoDB.');

    // Declare bulkOperations array
    const bulkOperations: AnyBulkWriteOperation[] = [];

    // Iterate over listOfSuccessObj and create a new Entry for each one
    listOfSuccessObj.forEach(async (item) => {
      const newEntry: IScraperResult = {
        store: item.storeName,
        price: item.price,
        date: item.lastUpdated,
        moment: item.lastUpdated.getHours() < 22 ? 'Morning' : 'Evening',
      };

      // Prepare update operation for each item
      bulkOperations.push({
        updateOne: {
          filter: { item_id: item._id },
          update: { $push: { data_full: newEntry } },
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
