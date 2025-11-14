import { agendaPostProcess } from '../index.js';
import postProcess from '../../services/postProcess/index.js';

agendaPostProcess.define('imagesFromScraping', async (job) => {
  const { itemIds } = job.attrs.data as { itemIds: number[] };

  try {
    console.log(
      `[Agenda - Post Process]: Running job imagesFromScraping for ${itemIds.length} items.`
    );

    await postProcess.imagesFromScraping(itemIds);

    console.log(
      `[Agenda - Post Process]: Finished imagesFromScraping job for ${itemIds.length} items.`
    );
  } catch (err) {
    console.error(
      `[Agenda - Post Process]: Failed imagesFromScraping job for ${itemIds.length} items.`,
      err
    );
  }
});
