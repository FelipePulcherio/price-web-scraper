import PQueue from 'p-queue';
import utils from './utils/index.js';
import { IImage, IShortItem } from '../../../interfaces/interfaces.js';
import { getItemsWithImagesByItemIds } from '../../../database/operations/dbRead.js';
import { createManyImages } from '../../../database/operations/dbCreate.js';
import { updateImageById } from '../../../database/operations/dbUpdate.js';

async function safePromiseAll<T>(
  tasks: { name: string; promise: Promise<T> }[],
  context: string
): Promise<T[]> {
  const results: T[] = [];

  await Promise.all(
    tasks.map(async ({ name, promise }) => {
      try {
        const result = await promise;
        // console.log(`[OK][${context}] ${name}`);
        results.push(result);
      } catch (err) {
        console.error(`[FAIL][${context}] ${name}`, err);
      }
    })
  );

  return results;
}

async function imagesFromScraping(itemIds: number[]): Promise<void> {
  // 0) Prepare concurrency queues
  const uploadToCloudinaryQueue = new PQueue({ concurrency: 10 });

  // 0) Prepare bulk CRUD operations
  const createData: IImage[] = [];
  const updateData: { id: number; data: any }[] = [];

  // 1) Get image info from DB
  const itemsFromDB: IShortItem[] = await getItemsWithImagesByItemIds(itemIds);

  console.log(
    `[Service - Post Process - Image From Scraping]: Updating ${itemsFromDB.length} items with images.`
  );

  // 2) Filter data
  let itemsWithoutImages: IShortItem[] = [];
  let itemsWithImages: IShortItem[] = [];

  for (const item of itemsFromDB) {
    // Check if we have a base image (referenceUrl not blank) - Ignore if not
    if (item.images.some((img) => img.referenceUrl !== '')) {
      // Check if they already have some cloud images (cloudinaryId not blank)
      if (item.images.some((img) => img.cloudinaryId !== '')) {
        // Items with images
        itemsWithImages.push(item);
      } else {
        // Items without images
        itemsWithoutImages.push(item);
      }
    }
  }

  const itemCount = itemsWithoutImages.length + itemsWithImages.length;

  // 2.1) If NONE of the items have a base image then end function
  if (itemCount === 0) {
    console.log(
      `[Service - Post Process - Image From Scraping]: Scraping didn't yield new images to be created.`
    );
    return;
  }

  // 3) NEW images to DB FROM items WITHOUT image
  for (const item of itemsWithoutImages) {
    for (let i = 0; i < item.images.length; i++) {
      uploadToCloudinaryQueue.add(async () => {
        try {
          const name = `${item.brand}_${item.model}_${i + 1}`;
          const publicId = `${item.brand}/${item.model}/${name}`;

          // 3.1) Push 'Upload image to cloudinary'
          const { public_id, optimizedUrl } = await utils.uploadToCloudinary(
            item.images[i].referenceUrl!,
            publicId,
            'Items'
          );

          // 3.2) Push 'Create a THUMBNAIL'
          if (i === 0) {
            createData.push({
              type: 'THUMBNAIL',
              name: `${item.brand}_${item.model}_THUMBNAIL`,
              cloudinaryId: public_id,
              cloudinaryUrl: optimizedUrl.replace(
                'f_auto,q_auto/',
                'f_auto,q_auto/w_150,h_150/'
              ),
              referenceUrl: '',
              itemId: item.id,
            });
          }

          // 3.3) Push 'Update the rest of the images'
          updateData.push({
            id: item.images[i].id!,
            data: {
              type: 'CAROUSEL',
              name,
              cloudinaryId: public_id,
              cloudinaryUrl: optimizedUrl,
            },
          });
        } catch (err) {
          console.error(
            `[Service - Post Process - Image From Scraping]: Upload failed for itemId: ${item.id}`,
            err
          );
        }
      });
    }
  }

  // 4) NEW images to DB FROM items WITH image
  for (const item of itemsWithImages) {
    // 4.1) Check if the images are already processed
    const allCloud = item.images.every(
      (img) => img.cloudinaryId !== '' && img.cloudinaryUrl !== ''
    );

    // 4.1.1) If image already have cloudinaryId and cloudinaryUrl, then skip it
    if (allCloud) {
      continue;
    }

    // 4.2) Extract the next starting number of image sequence
    let newFirstNumber = utils.getNextNumber(item.images);

    for (let i = 0; i < item.images.length; i++) {
      uploadToCloudinaryQueue.add(async () => {
        try {
          const name = `${item.brand}_${item.model}_${i + newFirstNumber}`;
          const publicId = `${item.brand}/${item.model}/${name}`;

          // 4.3) Push 'Upload image to cloudinary'
          const { public_id, optimizedUrl } = await utils.uploadToCloudinary(
            item.images[i].referenceUrl!,
            publicId,
            'Items'
          );

          // 4.4) Push 'Update the rest of the images'
          updateData.push({
            id: item.images[i].id!,
            data: {
              type: 'CAROUSEL',
              name,
              cloudinaryId: public_id,
              cloudinaryUrl: optimizedUrl,
            },
          });
        } catch (err) {
          console.error(
            `[Service - Post Process - Image From Scraping]: Upload failed for itemId: ${item.id}`,
            err
          );
        }
      });
    }
  }

  // 5) Run Batches: Upload to Cloudinary + Create on DB + Update in DB
  // 5) Concurrently (rate-limited) upload all images to cloudinary
  await uploadToCloudinaryQueue.onIdle();

  // 5.1) Bulk create images on DB
  if (createData.length > 0) {
    await createManyImages(createData);
  }

  // 5.2) Bulk update images in DB
  // TO DO: Replace Promise.all with $transaction
  if (updateData.length > 0) {
    await safePromiseAll(
      updateData.map((update) => ({
        name: `NEW imageId:${update.id}`,
        promise: updateImageById(update.id, update.data),
      })),
      'DB Update'
    );
  }

  console.log(
    `[Service - Post Process - Image From Scraping]: Finished creating ${createData.length} and updating ${updateData.length} images.`
  );
}

export default imagesFromScraping;
