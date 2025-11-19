import express from 'express';
import viewEngine from './config/viewEngine.js';
import routerAPI from './route/api.js';
import { getHomePage } from './controller/homeController.js';
import connectDB from './config/database.js';
import cors from 'cors'
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 1000,
    message: "Too many request from this IP"
});
app.use(limiter);
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
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