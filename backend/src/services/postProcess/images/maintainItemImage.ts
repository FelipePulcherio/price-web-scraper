import prisma from '../../../loaders/prisma.js';
import PQueue from 'p-queue';
import cloudinary from './client.js';
import {
  getItemsWithImagesByItemIds,
  getAllItemsWithImages,
  getCountAllItems,
} from '../../../database/operations/dbRead.js';
import { createImageAndConnectToItem } from '../../../database/operations/dbCreate.js';
import { updateImageById } from '../../../database/operations/dbUpdate.js';
import { IImage, IShortItem } from '../../../interfaces/interfaces.js';

async function uploadToCloudinary(
  imageUrl: string,
  publicId: string,
  folder: string
): Promise<{ public_id: string; optimizedUrl: string }> {
  // Upload directly from URL
  const result = await cloudinary.uploader.upload(imageUrl, {
    public_id: publicId,
    folder,
    unique_filename: false,
    overwrite: false,
  });

  const optimizedUrl = cloudinary.url(result.public_id, {
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { crop: 'fill', gravity: 'auto' },
    ],
  });

  return { public_id: result.public_id, optimizedUrl };
}

function chunkItems(totalItems: number, maxChunkSize = 100): number[] {
  const result: number[] = [];
  for (let i = 0; i < totalItems; i += maxChunkSize) {
    result.push(i);
  }
  return result;
}

export function extractImageNumber(name: string): number | null {
  const match = name?.match(/_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

function getNextNumber(images: IImage[]): number {
  const existingNumbers = images
    .map((img) => {
      const match = img.name?.match(/_(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  let nextNumber = existingNumbers.length > 0 ? existingNumbers.at(-1)! + 1 : 1;

  return nextNumber;
}

async function maintainItemImages(itemIds?: number[]): Promise<void> {
  // 0) Prepare concurrency queues
  const uploadQueue = new PQueue({ concurrency: 10 });
  const maintainQueue = new PQueue({ concurrency: 10 });

  // 0) Prepare bulk CRUD operations
  const createData: any[] = [];
  const updateData: { id: number; data: any }[] = [];
  const reuploadUpdates: { id: number; data: any }[] = [];

  // 1) If itemIds exist, get their image info from DB
  let allItems: IShortItem[] = [];
  let itemCount: number = 0;
  const chunkSize = 1000;

  if (itemIds) {
    const items = await getItemsWithImagesByItemIds(itemIds);
    allItems.push(...items);

    itemCount = items.length;
  }
  // 1.1) If itemIds doesn't exist, get all images in DB
  else {
    itemCount = await getCountAllItems();

    // 1.2) Chunk size prior fetching all images from DB
    const pagination = chunkItems(itemCount, chunkSize);

    // 1.3) Fetch all items from DB
    for (const offset of pagination) {
      const items = await getAllItemsWithImages(offset, chunkSize);
      allItems.push(...items);
    }
  }

  console.log(
    `[Service - Post Process - Maintain Image]: Updating ${itemCount} items with images.`
  );

  // 2) Filter data
  const notInCloudinary = allItems.filter(
    (item) =>
      item.images && // Has images array
      item.images.length > 0 && // Images array is not empty
      item.images.some((img) => img.cloudinaryId === '') // Filter out items with processed images
  );

  const inCloudinary = allItems.filter(
    (item) =>
      item.images && // Has images array
      item.images.length > 0 && // Images array is not empty
      item.images.some((img) => img.cloudinaryId !== '') // Filter out items without processed images
  );

  // 3) Skip if both are empty
  if (notInCloudinary.length === 0 && inCloudinary.length === 0) {
    return;
  }

  // 4) Upload NEW images to DB
  for (const item of notInCloudinary) {
    for (let i = 0; i < item.images.length; i++) {
      uploadQueue.add(async () => {
        try {
          const name = `${item.brand}_${item.model}_${i + 1}`;
          const publicId = `${item.brand}/${item.model}/${name}`;

          // 4.1) Upload image to cloudinary
          const { public_id, optimizedUrl } = await uploadToCloudinary(
            item.images[i].referenceUrl!,
            publicId,
            'Items'
          );

          // 4.2) Push 'Create a THUMBNAIL'
          if (i === 0) {
            createData.push({
              type: 'THUMBNAIL',
              name: `${item.brand}_${item.model}_THUMBNAIL`,
              cloudinaryId: public_id,
              cloudinaryUrl: optimizedUrl,
              referenceUrl: item.images[i].referenceUrl,
              itemId: item.id,
            });
          }

          // 4.3) Push 'Create the rest of the images'
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
            `[Service - Post Process - Maintain Image]: Upload failed for ${item.id}`,
            err
          );
        }
      });
    }
  }

  // 4.4) Concurrently (rate-limited) upload all images to cloudinary
  await uploadQueue.onIdle();

  // 4.5) Bulk write images to DB
  if (createData.length > 0) {
    await prisma.image.createMany({ data: createData, skipDuplicates: true });
  }

  // 4.6) Bulk update images in DB
  // TO DO: Replace Promise.all with $transaction
  if (updateData.length > 0) {
    await Promise.all(
      updateData.map((u) =>
        prisma.image.update({ where: { id: u.id }, data: u.data })
      )
    );
  }

  // 5) Maintain existing images in Cloudinary
  for (const item of inCloudinary) {
    // 5.1) Extract numeric suffix from images
    let nextNumber = getNextNumber(item.images);

    for (const img of item.images) {
      // 5.2) Only process images with cloudinaryId
      if (!img.cloudinaryId) continue;

      maintainQueue.add(async () => {
        // 5.3) Check Cloudinary for existence
        const exists = await cloudinary.api
          .resource(img.cloudinaryId!)
          .catch(() => null);

        // 5.4) If missing, reupload and update DB
        if (!exists) {
          // 5.4.1) Decide between 'THUMBNAIL' or 'CAROUSEL' type
          const newName =
            img.type === 'THUMBNAIL'
              ? `${item.brand}_${item.model}_THUMBNAIL`
              : `${item.brand}_${item.model}_${nextNumber++}`;

          const { public_id, optimizedUrl } = await uploadToCloudinary(
            img.referenceUrl!,
            img.cloudinaryId!,
            'Items'
          );

          reuploadUpdates.push({
            id: img.id!,
            data: {
              name: newName,
              type: img.type,
              cloudinaryId: public_id,
              cloudinaryUrl: optimizedUrl,
            },
          });
        }
      });
    }
  }

  // 5.5) Concurrently (rate-limited) reupload images to cloudinary
  await maintainQueue.onIdle();

  // 5.6) Bulk update images in DB
  if (reuploadUpdates.length > 0) {
    await Promise.all(
      reuploadUpdates.map((u) =>
        prisma.image.update({ where: { id: u.id }, data: u.data })
      )
    );
  }

  console.log(
    `[Service - Post Process - Maintain Image]: Finished updating ${itemCount}} images.`
  );
}

export default maintainItemImages;
