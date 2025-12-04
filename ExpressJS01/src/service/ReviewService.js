import { Review } from '../model/review.js';
import { Order } from '../model/order.js';
import { Product } from '../model/product.js';

class ReviewService {
    // Create a review
    async createReview(userId, productId, reviewData) {
        const { rating, comment, images } = reviewData;

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            throw new Error('You have already reviewed this product');
        }

        // Check if user purchased this product
        const hasPurchased = await Order.findOne({
            user: userId,
            'items.product': productId,
            status: 'delivered'
        });

        const review = await Review.create({
            user: userId,
            product: productId,
            rating,
            comment,
            images: images || [],
            isVerifiedPurchase: !!hasPurchased,
            order: hasPurchased?._id
        });

        return review.populate('user', 'name');
    }

    // Get reviews for a product
    async getProductReviews(productId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [reviews, total, stats] = await Promise.all([
            Review.find({ product: productId })
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ product: productId }),
            Review.aggregate([
                { $match: { product: productId } },
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 },
                        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                    }
                }
            ])
        ]);

        // Need to convert productId to ObjectId for aggregation
        const mongoose = await import('mongoose');
        const objectId = new mongoose.Types.ObjectId(productId);
        
        const statsResult = await Review.aggregate([
            { $match: { product: objectId } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        return {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            stats: statsResult[0] || {
                avgRating: 0,
                totalReviews: 0,
                rating5: 0,
                rating4: 0,
                rating3: 0,
                rating2: 0,
                rating1: 0
            }
        };
    }

    // Update review
    async updateReview(reviewId, userId, updateData) {
        const review = await Review.findOne({ _id: reviewId, user: userId });
        if (!review) {
            throw new Error('Review not found');
        }

        const { rating, comment, images } = updateData;
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;
        if (images) review.images = images;

        await review.save();
        return review.populate('user', 'name');
    }

    // Delete review
    async deleteReview(reviewId, userId, isAdmin = false) {
        const query = isAdmin ? { _id: reviewId } : { _id: reviewId, user: userId };
        const review = await Review.findOneAndDelete(query);
        
        if (!review) {
            throw new Error('Review not found');
        }

        return review;
    }

    // Get user's review for a product
    async getUserReview(userId, productId) {
        return Review.findOne({ user: userId, product: productId })
            .populate('user', 'name');
    }

    // Get count of reviewers for a product
    async getReviewersCount(productId) {
        return Review.countDocuments({ product: productId });
    }

    // Get review stats only (for product detail)
    async getReviewStats(productId) {
        const mongoose = await import('mongoose');
        const objectId = new mongoose.Types.ObjectId(productId);
        
        const statsResult = await Review.aggregate([
            { $match: { product: objectId } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        return statsResult[0] || { avgRating: 0, totalReviews: 0 };
    }
}

export default new ReviewService();
