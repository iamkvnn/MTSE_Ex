import express from 'express';
import { getAboutPage, getCRUD, getHomePage, postCRUD, getFindAllCrud, getEditCRUD, putCRUD, deleteCRUD } from '../controller/homeController';

const router = express.Router();

const initWebRoute = (app) => {
    router.get('/', (req, res) => {
        return res.send('abc');
    });

    router.get('/home', getHomePage);
    router.get('/about', getAboutPage);
    router.get('/crud', getCRUD);
    router.post('/post-crud', postCRUD);
    router.get('/get-crud', getFindAllCrud);
    router.get('/edit-crud', getEditCRUD);
    router.post('/put-crud', putCRUD);
    router.get('/delete-crud', deleteCRUD);

    return app.use('/', router);
}

export default initWebRoute;