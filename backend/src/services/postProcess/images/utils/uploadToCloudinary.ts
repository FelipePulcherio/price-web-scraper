import cloudinary from '../client.js';
import { decodoAxiosClient as axiosClient } from '../../../stores/storesApiClient.js';
import { Readable } from 'stream';

export default async function (
  imageUrl: string,
  publicId: string,
  folder: string
): Promise<{ public_id: string; optimizedUrl: string }> {
  // 1) Try upload directly from URL
  try {
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
  } catch (err: any) {
    const status =
      err?.http_code ||
      err?.status ||
      err?.response?.status ||
      err?.error?.http_code;

    // Only fallback on blocked/forbidden/missing image errors
    if (![403, 404].includes(status)) {
      throw err;
    }

    console.log(
      `[Post Process - Images - Utils - Upload to Cloudinary] URL upload blocked. Falling back to proxy for ${imageUrl}`
    );
  }

  // 2) Fallback to straming image with proxy
  try {
    // 2.1) Download image through proxy
    const response = await axiosClient.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        Accept: '*/*',
        Referer: 'https://www.visions.ca/',
      },
    });

    const buffer = Buffer.from(response.data);

    // 2.2) Convert buffer into a stream for Cloudinary
    const stream = Readable.from(buffer);

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder,
          unique_filename: false,
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.pipe(uploadStream);
    });

    const optimizedUrl = cloudinary.url(result.public_id, {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { crop: 'fill', gravity: 'auto' },
      ],
    });

    return { public_id: result.public_id, optimizedUrl };
  } catch (err) {
    console.error(
      `[Post Process - Images - Utils - Upload to Cloudinary] Proxy fallback failed:`,
      err
    );
    throw err;
  }
}
