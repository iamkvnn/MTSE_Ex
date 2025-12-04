import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Ensure no duplicate products in wishlist
wishlistSchema.index({ user: 1, 'products.product': 1 }, { unique: true, sparse: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
