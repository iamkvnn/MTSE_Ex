import { useEffect, useState, useRef, useCallback } from 'react';
import { getProductsAPI, getCategoriesAPI } from '../utils/api';
import '../styles/products.css';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState('');
    
    const observer = useRef();
    const lastProductRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Fetch categories on mount
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
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            
            try {
                const response = await getProductsAPI(page, 10, selectedCategory, searchTerm);
                
                if (response.EC === 0) {
                    if (page === 1) {
                        setProducts(response.products);
                    } else {
                        setProducts(prev => [...prev, ...response.products]);
                    }
                    setHasMore(response.pagination.hasMore);
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
        
        fetchProducts();
    }, [page, selectedCategory, searchTerm]);

    // Reset when category or search changes
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
    }, [selectedCategory, searchTerm]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is already handled by the searchTerm state
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
        <div className="products-page">
            <div className="products-header">
                <h1>Our Products</h1>
                <p>Discover our wide range of quality products</p>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        Search
                    </button>
                </form>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
                <button
                    className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('all')}
                >
                    All Products
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {getCategoryLabel(category)}
                    </button>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Products Grid */}
            <div className="products-grid">
                {products.map((product, index) => {
                    if (products.length === index + 1) {
                        return (
                            <div
                                ref={lastProductRef}
                                key={product._id}
                                className="product-card"
                            >
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                    <span className="product-category">
                                        {getCategoryLabel(product.category)}
                                    </span>
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-description">{product.description}</p>
                                    <div className="product-footer">
                                        <span className="product-price">{formatPrice(product.price)}</span>
                                        <span className="product-stock">
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                    <button 
                                        className="add-to-cart-btn"
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div key={product._id} className="product-card">
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                    <span className="product-category">
                                        {getCategoryLabel(product.category)}
                                    </span>
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-description">{product.description}</p>
                                    <div className="product-footer">
                                        <span className="product-price">{formatPrice(product.price)}</span>
                                        <span className="product-stock">
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                    <button 
                                        className="add-to-cart-btn"
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading more products...</p>
                </div>
            )}

            {/* No More Products */}
            {!loading && !hasMore && products.length > 0 && (
                <div className="no-more-products">
                    <p>You've reached the end of the list</p>
                </div>
            )}

            {/* No Products Found */}
            {!loading && products.length === 0 && (
                <div className="no-products">
                    <p>No products found</p>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
