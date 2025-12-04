import { Wishlist } from '../model/wishlist.js';
import { Product } from '../model/product.js';

class WishlistService {
    // Get wishlist by user
    async getWishlist(userId) {
        let wishlist = await Wishlist.findOne({ user: userId })
            .populate('products.product');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, products: [] });
        }

        // Filter out inactive products
        wishlist.products = wishlist.products.filter(
            item => item.product && item.product.isActive
        );

        return wishlist;
    }

    // Add product to wishlist
    async addToWishlist(userId, productId) {
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            throw new Error('Product not found');
        }

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                products: [{ product: productId }]
            });
        } else {
            const exists = wishlist.products.find(
                item => item.product.toString() === productId
            );

            if (exists) {
                throw new Error('Product already in wishlist');
            }

            wishlist.products.push({ product: productId });
            await wishlist.save();
        }

        return wishlist.populate('products.product');
    }

    // Remove product from wishlist
    async removeFromWishlist(userId, productId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            throw new Error('Wishlist not found');
        }

        wishlist.products = wishlist.products.filter(
            item => item.product.toString() !== productId
        );

        await wishlist.save();
        return wishlist.populate('products.product');
    }

    // Check if product is in wishlist
    async isInWishlist(userId, productId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) return false;

        return wishlist.products.some(
            item => item.product.toString() === productId
        );
    }

    // Clear wishlist
    async clearWishlist(userId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            throw new Error('Wishlist not found');
        }

        wishlist.products = [];
        await wishlist.save();
        return wishlist;
    }
}

export default new WishlistService();
