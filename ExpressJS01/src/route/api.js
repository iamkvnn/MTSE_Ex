import express from 'express';
import { createUser, getUser } from '../controller/userController.js';
import { getAccount, handleLogin } from '../controller/userController.js';
import { auth, isAdmin } from '../middleware/auth.js';
import { validateLogin } from '../middleware/login-validator.js';
import { validateUser } from '../middleware/user-validator.js';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
} from '../controller/productController.js';

const routerAPI = express.Router();

routerAPI.use(auth);

routerAPI.get('/', (req, res) => {
    return res.status(200).json({ message: 'Hello world API' });
});


routerAPI.post('/register', validateUser, createUser);
routerAPI.post('/login', validateLogin, handleLogin);
routerAPI.get('/user', isAdmin, getUser);
routerAPI.get('/account', getAccount);
routerAPI.get('/products', getProducts);
routerAPI.get('/products/categories', getCategories);
routerAPI.get('/products/:id', getProductById);
routerAPI.post('/admin/products', isAdmin, createProduct);
routerAPI.put('/admin/products/:id', isAdmin, updateProduct);
routerAPI.delete('/admin/products/:id', isAdmin, deleteProduct);

export default routerAPI;