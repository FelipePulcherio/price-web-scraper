import { connect, connection } from 'mongoose';
import { mongoConfig } from '../../config/config';

// FUNCTIONS

export async function deleteScraperJobsCollection(): Promise<void> {
  // Connect to MongoDB with mongoose
  try {
    await connect(mongoConfig.MONGO_URI, mongoConfig.MONGO_CONNECT_OPTIONS);
    console.log('Db_delete: Connected to MongoDB.');

    const schedulerCollection = await connection.db
      .listCollections({ name: 'Scheduler-jobs' })
      .hasNext();

    // Check if collection exists
    if (schedulerCollection) {
      const deleteResult = await connection.db
        .collection('Scheduler-jobs')
        .deleteMany({ name: 'fetcher' });

      if (deleteResult.deletedCount > 0) {
        console.log(
          `Db_delete: Deleted ${deleteResult.deletedCount} documents with name "fetcher" in the "Scheduler-jobs" collection.`
        );
      } else {
        console.log(
          'Db_delete: No documents with name "fetcher" were found in the "Scheduler-jobs" collection.'
        );
      }
    } else {
      console.log('Db_delete: "Scheduler-jobs" collection was not found.');
    }
  } catch (err) {
    console.error(`Db_delete: Error connecting to the database: ${err}`);
  } finally {
    await connection.close();
    console.log('Db_delete: Mongoose connection closed.');
  }
}
