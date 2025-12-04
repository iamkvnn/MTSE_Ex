import ProductViewService from '../service/ProductViewService.js';

// Get recently viewed products
export const getRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user?._id || null;
        const { limit = 10 } = req.query;
        
        if (!userId) {
            return res.status(200).json({
                EC: 0,
                products: []
            });
        }
        
        const products = await ProductViewService.getRecentlyViewed(userId, parseInt(limit));
        
        return res.status(200).json({
            EC: 0,
            products
        });
    } catch (error) {
        console.error('Error fetching recently viewed:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error fetching recently viewed products'
        });
    }
};
