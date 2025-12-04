import express from 'express';
import viewEngine from './config/viewEngine.js';
import routerAPI from './route/api.js';
import { getHomePage } from './controller/homeController.js';
import connectDB from './config/database.js';
import cors from 'cors'
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { initElasticsearch } from './config/elasticsearch.js';
import { setupGraphQL } from './graphql/index.js';
import { auth } from './middleware/auth.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 1000,
    message: "Too many request"
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
app.use(auth);
app.use('/', webAPI);
app.use('/api/v1', routerAPI);

(async () => {
    try {
        await connectDB();

        const esAvailable = await initElasticsearch();
        if (esAvailable) {
            console.log('Elasticsearch initialized successfully');
        } else {
            console.log('Elasticsearch not available, using MongoDB for search');
        }
        await setupGraphQL(app);
        
        app.listen(PORT, () => {
            console.log(`Backend Node.js is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
})();