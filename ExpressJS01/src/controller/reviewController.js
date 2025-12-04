import ReviewService from '../service/ReviewService.js';

// Create a review
export const createReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        
        const review = await ReviewService.createReview(userId, productId, req.body);
        
        return res.status(201).json({
            EC: 0,
            EM: 'Review created successfully',
            review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(400).json({
            EC: 1,
            EM: error.message || 'Error creating review'
        });
    }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await ReviewService.getProductReviews(productId, page, limit);
        
        return res.status(200).json({
            EC: 0,
            ...result
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error fetching reviews'
        });
    }
};

// Update review
export const updateReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;
        
        const review = await ReviewService.updateReview(reviewId, userId, req.body);
        
        return res.status(200).json({
            EC: 0,
            EM: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(400).json({
            EC: 1,
            EM: error.message || 'Error updating review'
        });
    }
};

// Delete review
export const deleteReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;
        const isAdmin = req.user.role === 'Admin';
        
        await ReviewService.deleteReview(reviewId, userId, isAdmin);
        
        return res.status(200).json({
            EC: 0,
            EM: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(400).json({
            EC: 1,
            EM: error.message || 'Error deleting review'
        });
    }
};

// Get user's review for a product
export const getUserReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        
        const review = await ReviewService.getUserReview(userId, productId);
        
        return res.status(200).json({
            EC: 0,
            review
        });
    } catch (error) {
        console.error('Error fetching user review:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Error fetching user review'
        });
    }
};
