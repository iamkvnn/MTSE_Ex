import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

config();

export const auth = (req, res, next) => {
    const whitelist = ['login', 'register', 'products', 'products/categories'];
    
    const isWhitelisted = whitelist.find(item => req.originalUrl.startsWith(`/api/v1/${item}`));
    
    if (isWhitelisted) {
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

export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            EC: 1,
            EM: 'Unauthorized - No user found' 
        });
    }
    
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ 
            EC: 1,
            EM: 'Forbidden - Admin access required' 
        });
    }
    
    next();
}
