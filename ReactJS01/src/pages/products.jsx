import { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useMutation } from '@apollo/client/react';
import { searchProductsAPI, getSuggestionsAPI, getCategoriesAPI } from '../utils/api';
import { ADD_TO_CART } from '../graphql/cartQueries';
import { AuthContext } from '../components/context/auth.context';
import { message } from 'antd';
import '../styles/products.css';

const ProductsPage = () => {
    const { auth } = useContext(AuthContext);
    const [messageApi, contextHolder] = message.useMessage();
    const [addToCart, { loading: addingToCart }] = useMutation(ADD_TO_CART);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState('');

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState('');
    const [appliedMaxPrice, setAppliedMaxPrice] = useState('');

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const searchInputRef = useRef(null);
    const suggestionsRef = useRef(null);
    
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

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [searchTerm]);
    
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length < 2) {
                setSuggestions([]);
                return;
            }
            
            setLoadingSuggestions(true);
            try {
                const response = await getSuggestionsAPI(searchTerm, 5);
                if (response.EC === 0) {
                    setSuggestions(response.suggestions);
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            } finally {
                setLoadingSuggestions(false);
            }
        };
        
        const timer = setTimeout(fetchSuggestions, 200);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            
            try {
                const response = await searchProductsAPI({
                    query: debouncedSearch,
                    category: selectedCategory,
                    minPrice: appliedMinPrice,
                    maxPrice: appliedMaxPrice,
                    page,
                    limit: 10
                });
                
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
    }, [page, selectedCategory, debouncedSearch, appliedMinPrice, appliedMaxPrice]);
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
    }, [selectedCategory, debouncedSearch, appliedMinPrice, appliedMaxPrice]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.name);
        setShowSuggestions(false);
    };

    const handleApplyPriceFilter = () => {
        setAppliedMinPrice(minPrice);
        setAppliedMaxPrice(maxPrice);
    };

    const handleClearPriceFilter = () => {
        setMinPrice('');
        setMaxPrice('');
        setAppliedMinPrice('');
        setAppliedMaxPrice('');
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
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

    // Hiển thị tên sản phẩm với highlight
    const renderHighlightedName = (product) => {
        if (product.highlight?.name) {
            return <span dangerouslySetInnerHTML={{ __html: product.highlight.name[0] }} />;
        }
        return product.name;
    };

    // Hiển thị mô tả với highlight
    const renderHighlightedDescription = (product) => {
        if (product.highlight?.description) {
            return <span dangerouslySetInnerHTML={{ __html: product.highlight.description[0] }} />;
        }
        return product.description;
    };

    // Thêm sản phẩm vào giỏ hàng
    const handleAddToCart = async (productId) => {
        if (!auth.isAuthenticated) {
            messageApi.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            return;
        }

        try {
            await addToCart({
                variables: { productId, quantity: 1 }
            });
            messageApi.success('Đã thêm sản phẩm vào giỏ hàng');
        } catch (err) {
            messageApi.error(err.message || 'Lỗi thêm vào giỏ hàng');
        }
    };

    const renderProductCard = (product, isLast) => (
        <div
            ref={isLast ? lastProductRef : null}
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
                <h3 className="product-name">{renderHighlightedName(product)}</h3>
                <p className="product-description">{renderHighlightedDescription(product)}</p>
                <div className="product-footer">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <span className="product-stock">
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
                <button 
                    className="add-to-cart-btn"
                    disabled={product.stock === 0}
                    onClick={() => handleAddToCart(product._id)}
                >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="products-page">
            {contextHolder}
            <div className="products-header">
                <h1>Our Products</h1>
                <p>Discover our wide range of quality products</p>
            </div>

            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-container">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            className="search-input"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div ref={suggestionsRef} className="suggestions-dropdown">
                                {loadingSuggestions && (
                                    <div className="suggestion-loading">Loading...</div>
                                )}
                                {suggestions.map((suggestion) => (
                                    <div
                                        key={suggestion._id}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        <img 
                                            src={suggestion.image} 
                                            alt={suggestion.name}
                                            className="suggestion-image"
                                        />
                                        <div className="suggestion-info">
                                            <span className="suggestion-name">{suggestion.name}</span>
                                            <span className="suggestion-price">{formatPrice(suggestion.price)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="search-button">
                        Search
                    </button>
                </form>
            </div>

            {/* Price Filter */}
            <div className="filter-section">
                <div className="price-filter">
                    <span className="filter-label">Price Range:</span>
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="price-input"
                        min="0"
                    />
                    <span className="price-separator">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="price-input"
                        min="0"
                    />
                    <button onClick={handleApplyPriceFilter} className="apply-filter-btn">
                        Apply
                    </button>
                    {(appliedMinPrice || appliedMaxPrice) && (
                        <button onClick={handleClearPriceFilter} className="clear-filter-btn">
                            Clear
                        </button>
                    )}
                </div>
            </div>

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

            {(debouncedSearch || appliedMinPrice || appliedMaxPrice || selectedCategory !== 'all') && (
                <div className="active-filters">
                    <span className="active-filters-label">Active Filters:</span>
                    {debouncedSearch && (
                        <span className="filter-tag">
                            Search: "{debouncedSearch}"
                            <button onClick={() => setSearchTerm('')}>×</button>
                        </span>
                    )}
                    {selectedCategory !== 'all' && (
                        <span className="filter-tag">
                            Category: {getCategoryLabel(selectedCategory)}
                            <button onClick={() => setSelectedCategory('all')}>×</button>
                        </span>
                    )}
                    {(appliedMinPrice || appliedMaxPrice) && (
                        <span className="filter-tag">
                            Price: {appliedMinPrice || '0'} - {appliedMaxPrice || '∞'}
                            <button onClick={handleClearPriceFilter}>×</button>
                        </span>
                    )}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="products-grid">
                {products.map((product, index) => 
                    renderProductCard(product, products.length === index + 1)
                )}
            </div>

            {loading && (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading more products...</p>
                </div>
            )}

            {!loading && !hasMore && products.length > 0 && (
                <div className="no-more-products">
                    <p>You've reached the end of the list</p>
                </div>
            )}

            {!loading && products.length === 0 && (
                <div className="no-products">
                    <p>No products found</p>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
