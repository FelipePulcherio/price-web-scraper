import { agendaScraper } from '@/agenda';
import '@/agenda/jobs/searchAllStores.job';

async function startScraperWorker() {
  await agendaScraper.start();
  console.log(
    '[Agenda Worker]: Scraper instance started and listening for jobs.'
  );
}

startScraperWorker().catch((err) => {
  console.error('[Agenda Worker]: Scraper failed to start', err);
  process.exit(1);
});
