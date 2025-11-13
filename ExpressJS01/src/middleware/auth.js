import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

config();

export const auth = (req, res, next) => {
    const whitelist = ['', 'login', 'register'];
    if (whitelist.find(item => `/api/v1/${item}` === req.originalUrl)) {
        return next();
    }

    const token = req.headers?.authorization?.split(' ')?.[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
