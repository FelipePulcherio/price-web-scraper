import { agendaPostProcess } from '@/agenda';
import '@/agenda/jobs/postProcess.job';

async function startPostProcessWorker() {
  await agendaPostProcess.start();
  console.log(
    '[Agenda Worker]: PostProcess instance started and listening for jobs.'
  );
}

startPostProcessWorker().catch((err) => {
  console.error('[Agenda Worker]: PostProcess failed to start', err);
  process.exit(1);
});
