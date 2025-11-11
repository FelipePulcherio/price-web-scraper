import imagePostProcess from './images/images';

export default async function (itemIds: number[]): Promise<void> {
  try {
    console.log(`[Post Process]: Starting for ${itemIds.length} items.`);

    // TODO: Implement image processing here (Cloudinary upload, etc.)
    for (const id of itemIds) {
      await imagePostProcess();
      console.log(`[Post Process]: working on item ID ${id}`);
      // Future: upload image, update DB, etc.
    }

    console.log('[Post Process]: Completed successfully.');
  } catch (err) {
    console.error('[Post Process]: Failed.', err);
    throw err;
  }
}
