import { Agenda } from '@hokify/agenda';
import config from '@/config';

export const agendaScraper = new Agenda({
  db: { address: config.mongoUri, collection: config.agenda.dbCollection },
  processEvery: '10 seconds',
});

export const agendaPostProcess = new Agenda({
  db: { address: config.mongoUri, collection: config.agenda.dbCollection },
  processEvery: '10 seconds',
});

// DEVELOPMENT ONLY: Start both instances inside App
export async function startAllAgendaJobs() {
  // Import job definitions (no new instances)
  await import('@/agenda/jobs/searchAllStores.job');
  await import('@/agenda/jobs/postProcess.job');

  // Start both instances
  await agendaScraper.start();
  console.log('[Agenda]: Scraper instance started.');

  await agendaPostProcess.start();
  console.log('[Agenda]: PostProcess instance started.');
}
