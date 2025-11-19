import { useEffect, useState, useContext } from 'react';
import { getProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI, getCategoriesAPI } from '../utils/api';
import { AuthContext } from '../components/context/auth.context';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const AdminPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'electronics',
        image: '',
        stock: '',
        isActive: true
    });

    // Check if user is admin
    useEffect(() => {
        if (!auth.isAuthenticated || auth.user.role !== 'Admin') {
            navigate('/login');
        }
    }, [auth, navigate]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesAPI();
                if (response.EC === 0) {
                    setCategories(response.categories);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        
        fetchCategories();
    }, []);

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, [page, selectedCategory, searchTerm]);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await getProductsAPI(page, 20, selectedCategory, searchTerm);
            
            if (response.EC === 0) {
                setProducts(response.products);
                setPagination(response.pagination);
            } else {
                setError(response.EM || 'Error loading products');
            }
        } catch (err) {
            setError('Error loading products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenModal = (mode, product = null) => {
        setModalMode(mode);
        if (mode === 'edit' && product) {
            setSelectedProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image: product.image,
                stock: product.stock,
                isActive: product.isActive
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'electronics',
                image: '',
                stock: '',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'electronics',
            image: '',
            stock: '',
            isActive: true
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            };
            
            let response;
            if (modalMode === 'create') {
                response = await createProductAPI(data);
            } else {
                response = await updateProductAPI(selectedProduct._id, data);
            }
            
            if (response.EC === 0) {
                setSuccess(response.EM);
                handleCloseModal();
                fetchProducts();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.EM || 'Error saving product');
            }
        } catch (err) {
            setError('Error saving product');
            console.error(err);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }
        
        try {
            const response = await deleteProductAPI(id);
            
            if (response.EC === 0) {
                setSuccess(response.EM);
                fetchProducts();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.EM || 'Error deleting product');
            }
        } catch (err) {
            setError('Error deleting product');
            console.error(err);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const getCategoryLabel = (category) => {
        return category.charAt(0).toUpperCase() + category.slice(1);
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage your products</p>
            </div>

            {/* Messages */}
            {error && <div className="message error-message">{error}</div>}
            {success && <div className="message success-message">{success}</div>}

            {/* Controls */}
            <div className="admin-controls">
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                
                <div className="category-filter">
                    <button
                        className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => handleCategoryChange('all')}
                    >
                        All
                    </button>
                    {['electronics', 'clothing', 'food', 'books', 'home', 'sports', 'other'].map(category => (
                        <button
                            key={category}
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {getCategoryLabel(category)}
                        </button>
                    ))}
                </div>
                
                <button 
                    className="btn btn-primary"
                    onClick={() => handleOpenModal('create')}
                >
                    + Add New Product
                </button>
            </div>

            {/* Products Table */}
            <div className="products-table-container">
                {loading ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Loading products...</p>
                    </div>
                ) : (
                    <>
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            <img 
                                                src={product.image} 
                                                alt={product.name}
                                                className="product-thumbnail"
                                            />
                                        </td>
                                        <td className="product-name-cell">{product.name}</td>
                                        <td>
                                            <span className="category-badge">
                                                {getCategoryLabel(product.category)}
                                            </span>
                                        </td>
                                        <td className="price-cell">{formatPrice(product.price)}</td>
                                        <td className="stock-cell">{product.stock}</td>
                                        <td>
                                            <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button 
                                                className="btn btn-sm btn-edit"
                                                onClick={() => handleOpenModal('edit', product)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-delete"
                                                onClick={() => handleDelete(product._id, product.name)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {products.length === 0 && (
                            <div className="no-products">
                                <p>No products found</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button 
                        className="btn btn-sm"
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button 
                        className="btn btn-sm"
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={page >= pagination.totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'create' ? 'Add New Product' : 'Edit Product'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    required
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price ($) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="electronics">Electronics</option>
                                    <option value="clothing">Clothing</option>
                                    <option value="food">Food</option>
                                    <option value="books">Books</option>
                                    <option value="home">Home</option>
                                    <option value="sports">Sports</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    Active
                                </label>
                            </div>
                            
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === 'create' ? 'Create Product' : 'Update Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
