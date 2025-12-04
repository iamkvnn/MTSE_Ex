import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

config();

export const auth = (req, res, next) => {
    const whitelist = [
        'login', 
        'register', 
        'products', 
        'products/categories',
        'products/search',
        'products/suggestions',
        'products/recently-viewed'
    ];
    
    // Check for whitelist paths - allow GET requests to product-related endpoints
    const isWhitelisted = whitelist.find(item => req.originalUrl.startsWith(`/api/v1/${item}`));
    
    // Allow public access to product details, reviews (GET only)
    const isPublicProductRoute = req.method === 'GET' && (
        req.originalUrl.match(/^\/api\/v1\/products\/[^/]+$/) ||
        req.originalUrl.match(/^\/api\/v1\/products\/[^/]+\/detail$/) ||
        req.originalUrl.match(/^\/api\/v1\/products\/[^/]+\/similar$/) ||
        req.originalUrl.match(/^\/api\/v1\/products\/[^/]+\/stats$/) ||
        req.originalUrl.match(/^\/api\/v1\/products\/[^/]+\/reviews$/)
    );
    
    if (isWhitelisted || isPublicProductRoute) {
        // Still try to decode token if present for user context
        const token = req.headers?.authorization?.split(' ')?.[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (err) {
                // Token invalid but route is public, continue without user
            }
        }
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
