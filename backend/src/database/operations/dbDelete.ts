import { connect, connection } from 'mongoose';
import config from '@/config';

// FUNCTIONS
export async function deleteScraperCollection(): Promise<void> {
  // Connect to MongoDB with mongoose
  try {
    await connect(config.mongoUri, {
      retryWrites: true,
      w: 'majority',
    });
    console.log('Db_delete: Connected to MongoDB.');

    if (connection.db) {
      const scraperCollection = await connection.db
        .listCollections({ name: 'Scraper' })
        .hasNext();

      // Check if collection exists
      if (scraperCollection) {
        const deleteResult = await connection.db
          .collection('Scraper')
          .deleteMany({});

        if (deleteResult.deletedCount > 0) {
          console.log(
            `Db_delete: Deleted ${deleteResult.deletedCount} documents in the "Scraper" collection.`
          );
        } else {
          console.log(
            'Db_delete: No documents were found in the "Scraper" collection.'
          );
        }
      } else {
        console.log('Db_delete: "Scraper" collection was not found.');
      }
    }
  } catch (err) {
    console.error(`Db_delete: Error connecting to the database: ${err}`);
  } finally {
    await connection.close();
    console.log('Db_delete: Mongoose connection closed.');
  }
}
