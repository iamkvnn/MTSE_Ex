import express from 'express';
import bodyParser from 'body-parser';
import configViewEngine from './config/viewEngine';
import { connectDB } from './config/configdb';
import initWebRoute from './route/web';

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
configViewEngine(app);
initWebRoute(app);
connectDB();

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Backend Node.js is running on port: ${PORT}`);
});
