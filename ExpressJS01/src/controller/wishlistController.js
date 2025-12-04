import WishlistService from '../service/WishlistService.js';

// Get user's wishlist
export const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const wishlist = await WishlistService.getWishlist(userId);
        
        return res.status(200).json({
            EC: 0,
            wishlist
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error fetching wishlist'
        });
    }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;
        
        const wishlist = await WishlistService.addToWishlist(userId, productId);
        
        return res.status(200).json({
            EC: 0,
            EM: 'Product added to wishlist',
            wishlist
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return res.status(400).json({
            EC: 1,
            EM: error.message || 'Error adding to wishlist'
        });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        
        const wishlist = await WishlistService.removeFromWishlist(userId, productId);
        
        return res.status(200).json({
            EC: 0,
            EM: 'Product removed from wishlist',
            wishlist
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(400).json({
            EC: 1,
            EM: error.message || 'Error removing from wishlist'
        });
    }
};

// Check if product is in wishlist
export const checkWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        
        const isInWishlist = await WishlistService.isInWishlist(userId, productId);
        
        return res.status(200).json({
            EC: 0,
            isInWishlist
        });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error checking wishlist'
        });
    }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await WishlistService.clearWishlist(userId);
        
        return res.status(200).json({
            EC: 0,
            EM: 'Wishlist cleared'
        });
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error clearing wishlist'
        });
    }
};
