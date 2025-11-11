import { Agenda } from '@hokify/agenda';
import config from '@/config';

export const agendaScraper = new Agenda({
  db: { address: config.mongoUri, collection: config.agenda.dbCollection },
});

export const agendaPostProcess = new Agenda({
  db: { address: config.mongoUri, collection: config.agenda.dbCollection },
});

export async function startAgenda() {
  await agendaScraper.start();
  console.log('[Agenda]: Scraper instance started and running.');

  await agendaPostProcess.start();
  console.log('[Agenda]: Post Process instance started and running.');
}
