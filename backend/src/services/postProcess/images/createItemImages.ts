import prisma from '@/loaders/prisma';
import cloudinary from './client';
import { getItemsWithImagesByItemIds } from '@/database/operations/dbRead';

async function createItemImages(itemIds: number[]): Promise<void> {
  console.log(
    `[Service - Post Process - Image]: Processing images for ${itemIds.length} items.`
  );

  const items = await getItemsWithImagesByItemIds(itemIds);

  const filteredResults = items.filter(
    (item) =>
      item.images && // Has images array
      item.images.length > 0 && // Images array is not empty
      item.images.some((img) => img.cloudinaryId === '') // Filter out items with processed images
  );

  if (filteredResults.length === 0) {
    console.log('[Service - Post Process - Image]: No images to process.');
    return;
  }

  for (const item of filteredResults) {
    try {
      const brand = item.brand ?? 'Unknown';
      const model = item.model ?? 'Unknown';

      for (let i = 0; i < item.images.length; i++) {
        const name = `${brand}_${model}_${i + 1}`;
        const publicId = `${brand}/${model}/${name}`;

        // console.log(
        //   `[Service - Post Process - Image]: Uploading image ${item.images[i].name} from ${item.images[i].url}`
        // );

        // Upload directly from URL
        const result = await cloudinary.uploader.upload(item.images[i].url!, {
          public_id: publicId,
          folder: 'Items',
          unique_filename: false,
          overwrite: false,
        });

        const optimizedUrl = cloudinary.url(result.public_id, {
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { crop: 'fill', gravity: 'auto' },
          ],
        });

        if (i === 0) {
          await prisma.image.create({
            data: {
              type: 'THUMBNAIL',
              name: name,
              cloudinaryId: result.public_id,
              url: optimizedUrl.replace(
                'f_auto,q_auto/',
                'f_auto,q_auto/w_150,h_150/'
              ),
              Item: { connect: { id: item.id } },
            },
          });
        }

        await prisma.image.update({
          where: { id: item.images[i].id },
          data: {
            type: 'CAROUSEL',
            name: name,
            cloudinaryId: result.public_id,
            url: optimizedUrl,
          },
        });

        // console.log(
        //   `[Service - Post Process - Image]: Image "${item.images[i].name}" uploaded successfully.`
        // );
      }
    } catch (err) {
      console.error(
        `[Service - Post Process - Image]: Failed to upload images from itemId "${item.id}"`,
        err
      );
    }
  }

  console.log('[Service - Post Process - Image]: Finished processing images.');
}

export default createItemImages;
