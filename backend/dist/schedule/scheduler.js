"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAgenda = startAgenda;
const config_1 = __importDefault(require("@/config"));
const agenda_1 = require("@hokify/agenda");
const dbDelete_1 = require("@/database/operations/dbDelete");
const dbRead_1 = require("@/database/operations/dbRead");
const scraperWorker_1 = require("../services/scraperWorker");
const dbCreate_1 = require("@/database/operations/dbCreate");
// import { analyzerComparison } from '../analyzer/analyzerComparison';
// Create new instance of Agenda
const scraperAgenda = new agenda_1.Agenda({
    db: { address: config_1.default.mongoUri, collection: config_1.default.agenda.dbCollection },
});
// Define new job for scraping data: "Scraper"
scraperAgenda.define('Scraper', async (job) => {
    console.log('Scheduler: Job "Scraper" running...');
    // STEP 1: Get information from DB
    const allItems = await (0, dbRead_1.getAllItemsForScraper)();
    // STEP 2: Save the result in job data
    job.attrs.data = allItems;
    await job.save();
    // STEP 3: Call scraper worker
    const events = await (0, scraperWorker_1.scraperWorker)(allItems);
    console.log('Scheduler: Scraping done.');
    // console.log(events);
    // console.log(events.length);
    // console.log(stores[0].items);
    // STEP 4: Create new Events on DB
    await (0, dbCreate_1.createEvent)(events);
    console.log('Scheduler: Creating events done.');
    console.log('Scheduler: Job "Scraper" completed!');
});
// Schedule the "Scraper" job to run every X hours
const runJobs = async () => {
    await scraperAgenda.every('24 hours', 'Scraper');
};
// Start Agenda
async function startAgenda() {
    // Delete all documents in 'Scraper' collection
    console.log('Scheduler: Clearing previous "Scraper" schedules');
    await (0, dbDelete_1.deleteScraperCollection)();
    // Actually start scraperAgenda
    await scraperAgenda.start();
    await runJobs();
    console.log('Scheduler: Agenda started!');
}
// Handle graceful shutdown (.on)
async function gracefulShutdown() {
    await scraperAgenda.stop();
    console.log('Scheduler: Agenda stopped!');
    process.exit(0);
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
//# sourceMappingURL=scheduler.js.map