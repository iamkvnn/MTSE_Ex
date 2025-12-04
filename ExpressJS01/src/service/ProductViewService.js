import { ProductView } from '../model/productView.js';
import { Order } from '../model/order.js';
import { Product } from '../model/product.js';
import mongoose from 'mongoose';

class ProductViewService {
    // Record a product view (only for authenticated users)
    async recordView(productId, userId) {
        if (!userId) return; // Only track for logged in users
        
        await ProductView.create({
            product: productId,
            user: userId
        });
    }

    // Get recently viewed products by user
    async getRecentlyViewed(userId, limit = 10) {
        if (!userId) return [];
        
        const views = await ProductView.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $sort: { viewedAt: -1 } },
            { $group: { _id: '$product', viewedAt: { $first: '$viewedAt' } } },
            { $sort: { viewedAt: -1 } },
            { $limit: limit }
        ]);

        const productIds = views.map(v => v._id);
        const products = await Product.find({ 
            _id: { $in: productIds },
            isActive: true
        });

        // Sort products by view order
        return productIds.map(id => 
            products.find(p => p._id.toString() === id.toString())
        ).filter(Boolean);
    }

    // Get unique viewers count for a product
    async getUniqueViewersCount(productId) {
        const result = await ProductView.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId) } },
            { $group: { _id: '$user' } },
            { $count: 'count' }
        ]);

        return result[0]?.count || 0;
    }

    // Get buyers count for a product (people who purchased)
    async getBuyersCount(productId) {
        const result = await Order.aggregate([
            { $match: { 'items.product': new mongoose.Types.ObjectId(productId), status: 'delivered' } },
            { $group: { _id: '$user' } },
            { $count: 'count' }
        ]);

        return result[0]?.count || 0;
    }

    // Get product stats
    async getProductStats(productId) {
        const [viewCount, buyersCount] = await Promise.all([
            this.getUniqueViewersCount(productId),
            this.getBuyersCount(productId)
        ]);

        return {
            viewCount,
            buyersCount
        };
    }
}

export default new ProductViewService();
