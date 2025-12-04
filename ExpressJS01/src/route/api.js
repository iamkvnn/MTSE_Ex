import express from 'express';
import { createUser, getUser } from '../controller/userController.js';
import { getAccount, handleLogin } from '../controller/userController.js';
import { isAdmin } from '../middleware/auth.js';
import { validateLogin } from '../middleware/login-validator.js';
import { validateUser } from '../middleware/user-validator.js';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    searchProducts,
    getSuggestions,
    getSimilarProducts
} from '../controller/productController.js';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
} from '../controller/orderController.js';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
    clearWishlist
} from '../controller/wishlistController.js';
import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getUserReview
} from '../controller/reviewController.js';
import {
    getRecentlyViewed
} from '../controller/productViewController.js';

const routerAPI = express.Router();

routerAPI.get('/', (req, res) => {
    return res.status(200).json({ message: 'Hello world API' });
});

// Auth routes
routerAPI.post('/register', validateUser, createUser);
routerAPI.post('/login', validateLogin, handleLogin);
routerAPI.get('/user', isAdmin, getUser);
routerAPI.get('/account', getAccount);

// Product routes (public)
routerAPI.get('/products', getProducts);
routerAPI.get('/products/categories', getCategories);
routerAPI.get('/products/search', searchProducts);
routerAPI.get('/products/suggestions', getSuggestions);
routerAPI.get('/products/recently-viewed', getRecentlyViewed);
routerAPI.get('/products/:id', getProductById);
routerAPI.get('/products/:productId/similar', getSimilarProducts);

// Review routes (public for reading)
routerAPI.get('/products/:productId/reviews', getProductReviews);
routerAPI.post('/products/:productId/reviews', createReview);
routerAPI.get('/products/:productId/my-review', getUserReview);
routerAPI.put('/reviews/:reviewId', updateReview);
routerAPI.delete('/reviews/:reviewId', deleteReview);

// Wishlist routes (authenticated)
routerAPI.get('/wishlist', getWishlist);
routerAPI.post('/wishlist', addToWishlist);
routerAPI.delete('/wishlist/:productId', removeFromWishlist);
routerAPI.get('/wishlist/check/:productId', checkWishlist);
routerAPI.delete('/wishlist', clearWishlist);

// Order routes (authenticated)
routerAPI.post('/orders', createOrder);
routerAPI.get('/orders', getMyOrders);
routerAPI.get('/orders/:id', getOrderById);
routerAPI.post('/orders/:id/cancel', cancelOrder);

// Admin routes
routerAPI.post('/admin/products', isAdmin, createProduct);
routerAPI.put('/admin/products/:id', isAdmin, updateProduct);
routerAPI.delete('/admin/products/:id', isAdmin, deleteProduct);
routerAPI.get('/admin/orders', isAdmin, getAllOrders);
routerAPI.put('/admin/orders/:id/status', isAdmin, updateOrderStatus);
routerAPI.get('/admin/orders/stats', isAdmin, getOrderStats);

export default routerAPI;