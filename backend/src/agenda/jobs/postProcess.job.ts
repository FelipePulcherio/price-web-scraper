import { agendaPostProcess } from '../index.js';
import postProcess from '../../services/postProcess/index.js';

agendaPostProcess.define('createItemImages', async (job) => {
  const { itemIds } = job.attrs.data as { itemIds: number[] };

  try {
    console.log(
      `[Agenda - Post Process]: Running job createItemImages for ${itemIds.length} items.`
    );

    await postProcess.maintainItemImages(itemIds);

    console.log(
      `[Agenda - Post Process]: Finished createItemImages job for ${itemIds.length} items.`
    );
  } catch (err) {
    console.error(
      `[Agenda - Post Process]: Failed createItemImages job for ${itemIds.length} items.`,
      err
    );
  }
});
