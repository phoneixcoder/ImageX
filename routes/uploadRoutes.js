import express from 'express';
import multer from 'multer';
import { handleFileUpload } from '../controllers/uploadController.js';
import { downloadFile } from '../controllers/downloadController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), handleFileUpload);
router.get('/download/:requestId', downloadFile);

export default router;
