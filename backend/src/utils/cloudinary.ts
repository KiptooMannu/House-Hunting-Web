import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: Buffer | string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'house-hunt-ke' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else {
      cloudinary.uploader.upload(file, { folder: 'house-hunt-ke' })
        .then(res => resolve(res.secure_url))
        .catch(err => reject(err));
    }
  });
};

export default cloudinary;
