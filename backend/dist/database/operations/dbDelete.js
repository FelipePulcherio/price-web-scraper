"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScraperCollection = deleteScraperCollection;
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("@/config"));
// FUNCTIONS
async function deleteScraperCollection() {
    // Connect to MongoDB with mongoose
    try {
        await (0, mongoose_1.connect)(config_1.default.mongoUri, {
            retryWrites: true,
            w: 'majority',
        });
        console.log('Db_delete: Connected to MongoDB.');
        if (mongoose_1.connection.db) {
            const scraperCollection = await mongoose_1.connection.db
                .listCollections({ name: 'Scraper' })
                .hasNext();
            // Check if collection exists
            if (scraperCollection) {
                const deleteResult = await mongoose_1.connection.db
                    .collection('Scraper')
                    .deleteMany({});
                if (deleteResult.deletedCount > 0) {
                    console.log(`Db_delete: Deleted ${deleteResult.deletedCount} documents in the "Scraper" collection.`);
                }
                else {
                    console.log('Db_delete: No documents were found in the "Scraper" collection.');
                }
            }
            else {
                console.log('Db_delete: "Scraper" collection was not found.');
            }
        }
    }
    catch (err) {
        console.error(`Db_delete: Error connecting to the database: ${err}`);
    }
    finally {
        await mongoose_1.connection.close();
        console.log('Db_delete: Mongoose connection closed.');
    }
}
//# sourceMappingURL=dbDelete.js.map