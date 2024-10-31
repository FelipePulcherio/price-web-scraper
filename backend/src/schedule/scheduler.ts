import Agenda from 'agenda';
import { mongoConfig } from '../config/config';
import {
  updateHistoryCollection,
  updateGraphCollection,
  updateItemCollection,
} from '../db/operations/dbUpdate';

// Create new instance of Agenda WITHOUT MONGOOSE
const scraperAgenda = new Agenda({
  db: { address: mongoConfig.MONGO_URI, collection: 'SchedulerJobs-scraper' },
});
