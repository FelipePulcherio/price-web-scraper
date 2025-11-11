import { agendaPostProcess } from '@/agenda';
import postProcess from '@/services/postProcess';

agendaPostProcess.define('postProcess', async (job) => {
  const { itemIds } = job.attrs.data as { itemIds: number[] };

  try {
    console.log(
      `[Agenda - Post Process]: Running job postProcess for ${itemIds.length} items.`
    );

    await postProcess(itemIds);

    console.log(
      `[Agenda - Post Process]: Finished job for ${itemIds.length} items.`
    );
  } catch (err) {
    console.error(
      `[Agenda - Post Process]: Failed job for ${itemIds.length} items.`,
      err
    );
  }
});
