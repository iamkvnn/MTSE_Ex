import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './config/viewEngine.js';
import initWebRoutes from './route/web.js';
import connectDB from './config/database.js';
require('dotenv').config();

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
viewEngine(app);
initWebRoutes(app);
connectDB();

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Backend Node.js is running on port: ${PORT}`);
});
