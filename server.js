import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import uploadRoutes from './routes/uploadRoutes.js';
import statusRoutes from './routes/statusRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT;
const databaseUrl = process.env.MONGODB_URI;

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/upload', uploadRoutes);
app.use('/status', statusRoutes);

app.listen(port, (error) => {
    if (error) {
        return console.log('Something went wrong', error);
    }
    mongoose.connect(databaseUrl).then(() => {
        console.log('Connected to database');
    }).catch((error) => {
        console.log('Error connecting to database:', error);
    }).finally(() => {
        console.log(`File compression app listening at http://localhost:${port}`);
    });
});
