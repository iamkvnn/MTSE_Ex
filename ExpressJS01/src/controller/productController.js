import {
    getProductsService,
    getProductByIdService,
    createProductService,
    updateProductService,
    deleteProductService,
    getCategoriesService,
} from '../service/ProductService.js';

import {
    searchProducts as searchProductsWithES,
    suggestProducts
} from '../service/elasticsearchService.js';

export const getProducts = async (req, res) => {
    try {
        const { page, limit, category, search } = req.query;
        
        const result = await getProductsService({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            category,
            search
        });
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getProducts:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error'
        });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            page,
            limit
        } = req.query;
        
        let result = await searchProductsWithES({
            query: search,
            category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10
        });

        if (result.EC === 1) {
            result = await getProductsService({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                category,
                search
            });
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in searchProducts:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error'
        });
    }
};

export const getSuggestions = async (req, res) => {
    try {
        const { search, limit } = req.query;
        
        if (!search || search.length < 2) {
            return res.status(200).json({
                EC: 0,
                suggestions: []
            });
        }
        
        const result = await suggestProducts(search, parseInt(limit) || 5);
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getSuggestions:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error'
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await getProductByIdService(id);
        
        if (result.EC === 1) {
            return res.status(404).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getProductById:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error'
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const result = await createProductService(req.body);
        
        if (result.EC === 1) {
            return res.status(400).json(result);
        }
        
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error in createProduct:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error'
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await updateProductService(id, req.body);
        
        if (result.EC === 1) {
            return res.status(404).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateProduct:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error'
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await deleteProductService(id);
        
        if (result.EC === 1) {
            return res.status(404).json(result);
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error'
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const result = await getCategoriesService();
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getCategories:', error);
        return res.status(500).json({
            EC: 1,
            EM: 'Internal server error'
        });
    }
};
