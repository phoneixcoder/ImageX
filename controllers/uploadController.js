import fs from 'fs-extra';
import { validateCsv } from '../middleware/validateCsv.js';
import { v4 as uuidv4 } from 'uuid';
import ProcessingRequest from '../models/processingRequest.js';
import { processImages } from '../utils/imageProcessingService.js';

export const handleFileUpload = async (req, res) => {
  const filePath = req.file.path;
  const requestId = uuidv4();

  try {
    const records = await validateCsv(filePath);
    for (const record of records) {
      const serialNumber = record['S. No.'];
      const productName = record['Product Name'];
      const imageUrls = record['Input Image Urls'].split(',');

      const processingRequest = new ProcessingRequest({
        requestId,
        serialNumber,
        productName,
        inputImageUrls: imageUrls,
      });

      await processingRequest.save();
      processImages(requestId, serialNumber, productName, imageUrls); 
    }
    res.status(200).json({ requestId });
  } catch (error) {
    console.error('Error processing CSV file:', error);
    res.status(400).send(`Error processing CSV file: ${error}`);
  } finally {
    fs.remove(filePath);
  }
};
