import axios from './axios.customize';

const createUserApi = (email, name, pass) => {
    const URL = '/api/v1/register';
    const data = { email, name, password: pass };
    return axios.post(URL, data);
}

const logiApi = (email, pass) => {
    const URL = '/api/v1/login';
    const data = { email, password: pass };
    return axios.post(URL, data);
}

const getUserApi = () => {
    const URL = `/api/v1/user`;
    return axios.get(URL);
}

const getProductsAPI = async (page = 1, limit = 10, category = 'all', search = '') => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    
    if (category && category !== 'all') {
        params.append('category', category);
    }
    
    if (search) {
        params.append('search', search);
    }
    
    return await axios.get(`/api/v1/products?${params.toString()}`);
};

// Tìm kiếm sản phẩm với Elasticsearch
const searchProductsAPI = async ({
    query = '',
    category = 'all',
    minPrice,
    maxPrice,
    page = 1,
    limit = 10
}) => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
    });
    
    if (query) {
        params.append('search', query);
    }
    
    if (category && category !== 'all') {
        params.append('category', category);
    }
    
    if (minPrice !== undefined && minPrice !== '') {
        params.append('minPrice', minPrice.toString());
    }
    
    if (maxPrice !== undefined && maxPrice !== '') {
        params.append('maxPrice', maxPrice.toString());
    }
    
    return await axios.get(`/api/v1/products/search?${params.toString()}`);
};

const getSuggestionsAPI = async (query, limit = 5) => {
    const params = new URLSearchParams({
        search: query,
        limit: limit.toString()
    });
    
    return await axios.get(`/api/v1/products/suggestions?${params.toString()}`);
};

const getProductByIdAPI = async (id) => {
    return await axios.get(`/api/v1/products/${id}`);
};

const getSimilarProductsAPI = async (productId, limit = 8) => {
    return await axios.get(`/api/v1/products/${productId}/similar?limit=${limit}`);
};

const getCategoriesAPI = async () => {
    return await axios.get('/api/v1/products/categories');
};

const createProductAPI = async (data) => {
    return await axios.post('/api/v1/admin/products', data);
};

const updateProductAPI = async (id, data) => {
    return await axios.put(`/api/v1/admin/products/${id}`, data);
};

const deleteProductAPI = async (id) => {
    return await axios.delete(`/api/v1/admin/products/${id}`);
};

// Cart - using GraphQL, no REST API

// Order APIs
const createOrderAPI = async (orderData) => {
    return await axios.post('/api/v1/orders', orderData);
};

const getMyOrdersAPI = async (page = 1, limit = 10) => {
    return await axios.get(`/api/v1/orders?page=${page}&limit=${limit}`);
};

const getOrderByIdAPI = async (id) => {
    return await axios.get(`/api/v1/orders/${id}`);
};

const cancelOrderAPI = async (id, reason) => {
    return await axios.post(`/api/v1/orders/${id}/cancel`, { reason });
};

// Admin Order APIs
const getAllOrdersAPI = async (page = 1, limit = 10, status = null) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status && status !== 'all') params.append('status', status);
    return await axios.get(`/api/v1/admin/orders?${params.toString()}`);
};

const updateOrderStatusAPI = async (id, status, cancelReason = null) => {
    return await axios.put(`/api/v1/admin/orders/${id}/status`, { status, cancelReason });
};

const getOrderStatsAPI = async () => {
    return await axios.get('/api/v1/admin/orders/stats');
};

// Wishlist APIs
const getWishlistAPI = async () => {
    return await axios.get('/api/v1/wishlist');
};

const addToWishlistAPI = async (productId) => {
    return await axios.post('/api/v1/wishlist', { productId });
};

const removeFromWishlistAPI = async (productId) => {
    return await axios.delete(`/api/v1/wishlist/${productId}`);
};

const checkWishlistAPI = async (productId) => {
    return await axios.get(`/api/v1/wishlist/check/${productId}`);
};

const clearWishlistAPI = async () => {
    return await axios.delete('/api/v1/wishlist');
};

// Review APIs
const getProductReviewsAPI = async (productId, page = 1, limit = 10) => {
    return await axios.get(`/api/v1/products/${productId}/reviews?page=${page}&limit=${limit}`);
};

const createReviewAPI = async (productId, reviewData) => {
    return await axios.post(`/api/v1/products/${productId}/reviews`, reviewData);
};

const updateReviewAPI = async (reviewId, reviewData) => {
    return await axios.put(`/api/v1/reviews/${reviewId}`, reviewData);
};

const deleteReviewAPI = async (reviewId) => {
    return await axios.delete(`/api/v1/reviews/${reviewId}`);
};

const getUserReviewAPI = async (productId) => {
    return await axios.get(`/api/v1/products/${productId}/my-review`);
};

// Product View APIs
const getRecentlyViewedAPI = async (limit = 10) => {
    return await axios.get(`/api/v1/products/recently-viewed?limit=${limit}`);
};

export {
    createUserApi,
    logiApi,
    getUserApi,
    getProductsAPI,
    searchProductsAPI,
    getSuggestionsAPI,
    getProductByIdAPI,
    getSimilarProductsAPI,
    getCategoriesAPI,
    createProductAPI,
    updateProductAPI,
    deleteProductAPI,
    // Orders
    createOrderAPI,
    getMyOrdersAPI,
    getOrderByIdAPI,
    cancelOrderAPI,
    getAllOrdersAPI,
    updateOrderStatusAPI,
    getOrderStatsAPI,
    // Wishlist
    getWishlistAPI,
    addToWishlistAPI,
    removeFromWishlistAPI,
    checkWishlistAPI,
    clearWishlistAPI,
    // Reviews
    getProductReviewsAPI,
    createReviewAPI,
    updateReviewAPI,
    deleteReviewAPI,
    getUserReviewAPI,
    // Product Views
    getRecentlyViewedAPI
}