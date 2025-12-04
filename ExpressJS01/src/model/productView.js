import mongoose from 'mongoose';

const productViewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for analytics
productViewSchema.index({ product: 1, viewedAt: -1 });
productViewSchema.index({ user: 1, viewedAt: -1 });

export const ProductView = mongoose.model('ProductView', productViewSchema);
