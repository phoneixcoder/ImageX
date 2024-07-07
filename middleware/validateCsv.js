import fs from 'fs';
import { parse } from 'csv-parse';

export const validateCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const parser = fs.createReadStream(filePath)
      .pipe(parse({ columns: true }));

    const records = [];
    parser.on('data', (record) => {
      if (!record['S. No.'] || !record['Product Name'] || !record['Input Image Urls']) {
        reject('Invalid CSV format');
      }
      records.push(record);
    });

    parser.on('end', () => {
      resolve(records);
    });

    parser.on('error', (error) => {
      reject(error.message);
    });
  });
};
