import { v2 as cloudinary } from 'cloudinary';
import config from '@/config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.key,
  api_secret: config.cloudinary.secret,
});

export default cloudinary;
