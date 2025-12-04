import { Product } from '../model/product.js';
import {
    indexProduct,
    updateProductInES,
} from './elasticsearchService.js';
import ProductViewService from './ProductViewService.js';
import ReviewService from './ReviewService.js';

export const getProductsService = async ({ page = 1, limit = 10, category, search }) => {
    try {
        const query = { isActive: true };
        if (category && category !== 'all') {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query)
        ]);
        
        return {
            EC: 0,
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + products.length < total
            }
        };
    } catch (error) {
        console.error('Error in getProductsService:', error);
        return {
            EC: 1,
            EM: 'Error fetching products',
            products: [],
            pagination: {}
        };
    }
};

export const getProductByIdService = async (id, userId = null) => {
    try {
        const product = await Product.findById(id).lean();
        
        if (!product || !product.isActive) {
            return {
                EC: 1,
                EM: 'Product not found'
            };
        }

        // Record view if user is authenticated
        if (userId) {
            await ProductViewService.recordView(id, userId);
        }

        // Get stats
        const [viewStats, reviewData] = await Promise.all([
            ProductViewService.getProductStats(id),
            ReviewService.getReviewStats(id)
        ]);

        return {
            EC: 0,
            product,
            stats: {
                viewCount: viewStats.viewCount,
                buyersCount: viewStats.buyersCount,
                reviewCount: reviewData.totalReviews,
                avgRating: reviewData.avgRating
            }
        };
    } catch (error) {
        console.error('Error in getProductByIdService:', error);
        return {
            EC: 1,
            EM: 'Error fetching product'
        };
    }
};

// Get similar products based on category
export const getSimilarProductsService = async (productId, limit = 8) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return {
                EC: 1,
                EM: 'Product not found',
                products: []
            };
        }

        // Get products in same category, excluding current product
        const similarProducts = await Product.find({
            _id: { $ne: productId },
            category: product.category,
            isActive: true
        })
        .limit(limit)
        .lean();

        // If not enough, get from other categories
        if (similarProducts.length < limit) {
            const moreProducts = await Product.find({
                _id: { $ne: productId },
                category: { $ne: product.category },
                isActive: true
            })
            .limit(limit - similarProducts.length)
            .lean();

            return {
                EC: 0,
                products: [...similarProducts, ...moreProducts]
            };
        }

        return {
            EC: 0,
            products: similarProducts
        };
    } catch (error) {
        console.error('Error in getSimilarProductsService:', error);
        return {
            EC: 1,
            EM: 'Error fetching similar products',
            products: []
        };
    }
};

export const createProductService = async (data) => {
    try {
        const product = await Product.create(data);

        await indexProduct(product);
        
        return {
            EC: 0,
            EM: 'Product created successfully',
            product
        };
    } catch (error) {
        console.error('Error in createProductService:', error);
        return {
            EC: 1,
            EM: error.message || 'Error creating product'
        };
    }
};

export const updateProductService = async (id, data) => {
    try {
        const product = await Product.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return {
                EC: 1,
                EM: 'Product not found'
            };
        }
        await updateProductInES(id, {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image,
            stock: product.stock,
            isActive: product.isActive,
            updatedAt: product.updatedAt
        });
        
        return {
            EC: 0,
            EM: 'Product updated successfully',
            product
        };
    } catch (error) {
        console.error('Error in updateProductService:', error);
        return {
            EC: 1,
            EM: error.message || 'Error updating product'
        };
    }
};

export const deleteProductService = async (id) => {
    try {
        const product = await Product.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );
        
        if (!product) {
            return {
                EC: 1,
                EM: 'Product not found'
            };
        }
        
        await updateProductInES(id, { isActive: false });
        
        return {
            EC: 0,
            EM: 'Product deleted successfully'
        };
    } catch (error) {
        console.error('Error in deleteProductService:', error);
        return {
            EC: 1,
            EM: 'Error deleting product'
        };
    }
};

export const getCategoriesService = async () => {
    try {
        const categories = await Product.distinct('category');
        
        return {
            EC: 0,
            categories
        };
    } catch (error) {
        console.error('Error in getCategoriesService:', error);
        return {
            EC: 1,
            EM: 'Error fetching categories',
            categories: []
        };
    }
};
