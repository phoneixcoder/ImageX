import { Schema, model } from 'mongoose';

const processingRequestSchema = new Schema({
    requestId: { type: String, required: true, unique: true },
    serialNumber: { type: String, required: true },
    productName: { type: String, required: true },
    inputImageUrls: { type: [String], required: true },
    outputImageUrls: { type: [String] },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

const ProcessingRequest = model('ProcessingRequest', processingRequestSchema);
export default ProcessingRequest;
