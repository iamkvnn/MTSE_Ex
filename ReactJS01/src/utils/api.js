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

export {
    createUserApi,
    logiApi,
    getUserApi,
    getProductsAPI,
    searchProductsAPI,
    getSuggestionsAPI,
    getProductByIdAPI,
    getCategoriesAPI,
    createProductAPI,
    updateProductAPI,
    deleteProductAPI
}