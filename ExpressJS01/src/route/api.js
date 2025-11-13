import express from 'express';
import { createUser, getUser } from '../controller/userController.js';
import { getAccount, handleLogin } from '../controller/userController.js';
import { auth } from '../middleware/auth.js';
import { delay } from '../middleware/delay.js';

const routerAPI = express.Router();

routerAPI.use(auth);

routerAPI.get('/', (req, res) => {
    return res.status(200).json({ message: 'Hello world API' });
});

routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);
routerAPI.get('/user', getUser);
routerAPI.get('/account', delay, getAccount);

export default routerAPI;