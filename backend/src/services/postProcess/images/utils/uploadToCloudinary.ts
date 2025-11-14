import cloudinary from '../client.js';

export default async function (
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
