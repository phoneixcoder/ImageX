import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ProcessingRequest from '../models/processingRequest.js';
import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const downloadFile = async (req, res) => {
  const { requestId } = req.params;

  try {
    const processingRequest = await ProcessingRequest.findOne({ requestId });
    if (!processingRequest) {
      return res.status(404).send('Request ID not found');
    }

    const { serialNumber, productName, inputImageUrls = [], outputImageUrls = [] } = processingRequest;

    const data = [{
      'Serial Number': serialNumber,
      'Product Name': productName,
      'Input Image Urls': inputImageUrls.join(','),
      'Output Image Urls': outputImageUrls.join(',')
    }];

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const csvFilePath = path.join(downloadsDir, `${requestId}.csv`);
    fs.writeFileSync(csvFilePath, csv);

    res.download(csvFilePath, `${requestId}.csv`, (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        return res.status(500).send('Error downloading the file');
      }
      fs.unlinkSync(csvFilePath);
    });
  } catch (error) {
    console.error('Error generating download file:', error);
    res.status(500).send('Internal Server Error');
  }
};
