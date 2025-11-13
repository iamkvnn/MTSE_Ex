import express from 'express';
import viewEngine from './config/viewEngine.js';
import routerAPI from './route/api.js';
import { getHomePage } from './controller/homeController.js';
import connectDB from './config/database.js';
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
viewEngine(app);
const webAPI = express.Router();
webAPI.get('/', getHomePage);
app.use('/', webAPI);
app.use('/api/v1', routerAPI);

(async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Backend Node.js is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
})();
connectDB();