import express from 'express';
import ProcessingRequest from '../models/processingRequest.js';

const router = express.Router();

router.get('/:requestId', async (req, res) => {
  const { requestId } = req.params;
  try {
    const processingRequest = await ProcessingRequest.findOne({ requestId });
    if (!processingRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(processingRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching status', error });
  }
});

export default router;
