import { Product } from '../model/product.js';

export const getProductsService = async ({ page = 1, limit = 10, category, search }) => {
    try {
        const query = { isActive: true };
        
        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Search by name or description
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

export const getProductByIdService = async (id) => {
    try {
        const product = await Product.findById(id).lean();
        
        if (!product || !product.isActive) {
            return {
                EC: 1,
                EM: 'Product not found'
            };
        }

        return {
            EC: 0,
            product
        };
    } catch (error) {
        console.error('Error in getProductByIdService:', error);
        return {
            EC: 1,
            EM: 'Error fetching product'
        };
    }
};

export const createProductService = async (data) => {
    try {
        const product = await Product.create(data);
        
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
