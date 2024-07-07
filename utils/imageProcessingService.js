import sharp from 'sharp';
import axios from 'axios';
import dotenv from 'dotenv';
import Queue from 'bull';
import cloudinary from 'cloudinary';
import ProcessingRequest from '../models/processingRequest.js';

const imageProcessingQueue = new Queue('image-processing', {
  redis: {
    host: 'viaduct.proxy.rlwy.net',
    port: 26058,
    password: "ZRizsmSLvzoONSlAWReWrEUJurJrOUNw"
  },
});
dotenv.config();
// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const processImages = (requestId, serialNumber, productName, imageUrls) => {
  imageProcessingQueue.add({ requestId, serialNumber, productName, imageUrls });
};

imageProcessingQueue.process(async (job) => {
  const { requestId, serialNumber, productName, imageUrls } = job.data;
  const outputImageUrls = [];

  try {
    for (const [index, imageUrl] of imageUrls.entries()) {
      let imageBuffer;
      if (/^data:image\/([A-Za-z-+\/]+);base64,/.test(imageUrl)) {
        imageBuffer = Buffer.from(imageUrl.split(',')[1], 'base64');
      } else {
        const response = await axios.get(imageUrl.trim(), { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(response.data, 'binary');
      }

      const compressedImageBuffer = await sharp(imageBuffer).jpeg({ quality: 50 }).toBuffer();

      const result = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }).end(compressedImageBuffer);
      });

      outputImageUrls.push(result.secure_url);
      console.log(`Processed and uploaded image: ${result.secure_url}`);
    }

    await ProcessingRequest.updateOne({ requestId }, { status: 'completed', outputImageUrls });
    console.log(`Status updated to 'completed' for request ${requestId}`);
  } catch (error) {
    console.error(`Error processing images for request ${requestId}:`, error);
    await ProcessingRequest.updateOne({ requestId }, { status: 'failed' });
  }
});

imageProcessingQueue.on('active', (job) => {
  console.log(`Job ${job.id} is now active; data: ${JSON.stringify(job.data)}`);
});

imageProcessingQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

imageProcessingQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err}`);
});
