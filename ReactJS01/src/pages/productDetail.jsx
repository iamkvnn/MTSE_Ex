import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { useMutation } from '@apollo/client/react';
import { ADD_TO_CART } from '../graphql/cartQueries';
import { message, Rate, Button, InputNumber, Tabs, Empty, Spin, Avatar, Progress, Modal, Input, Form } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import {
    getProductByIdAPI,
    addToWishlistAPI,
    removeFromWishlistAPI,
    checkWishlistAPI,
    getProductReviewsAPI,
    createReviewAPI,
    getSimilarProductsAPI,
    getRecentlyViewedAPI
} from '../utils/api';
import '../styles/productDetail.css';

const { TextArea } = Input;

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [messageApi, contextHolder] = message.useMessage();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewPage, setReviewPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(true);

    // Stats state
    const [stats, setStats] = useState({ viewCount: 0, buyersCount: 0, reviewCount: 0, avgRating: 0 });

    // Similar & Recently viewed
    const [similarProducts, setSimilarProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    // Review modal
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewForm] = Form.useForm();
    const [submittingReview, setSubmittingReview] = useState(false);

    // GraphQL mutation for cart
    const [addToCart] = useMutation(ADD_TO_CART);

    useEffect(() => {
        fetchProductDetail();
        fetchSimilarProducts();
        fetchReviews();
        if (auth.isAuthenticated) {
            checkWishlistStatus();
            fetchRecentlyViewed();
        }
    }, [id]);

    const fetchProductDetail = async () => {
        setLoading(true);
        try {
            const response = await getProductByIdAPI(id);
            if (response.EC === 0) {
                setProduct(response.product);
                setStats({
                    viewCount: response.stats?.viewCount || 0,
                    buyersCount: response.stats?.buyersCount || 0,
                    reviewCount: response.stats?.reviewCount || 0,
                    avgRating: response.stats?.avgRating || 0
                });
            } else {
                messageApi.error(response.EM || 'Không tìm thấy sản phẩm');
                navigate('/products');
            }
        } catch (error) {
            messageApi.error('Lỗi tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await getProductReviewsAPI(id, 1, 10);
            if (response.EC === 0) {
                setReviews(response.reviews || []);
                setReviewStats(response.stats);
                setHasMoreReviews(response.pagination?.page < response.pagination?.totalPages);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const fetchSimilarProducts = async () => {
        try {
            const response = await getSimilarProductsAPI(id, 8);
            if (response.EC === 0) {
                setSimilarProducts(response.products);
            }
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    };

    const fetchRecentlyViewed = async () => {
        try {
            const response = await getRecentlyViewedAPI(10);
            if (response.EC === 0) {
                // Filter out current product
                setRecentlyViewed(response.products.filter(p => p._id !== id));
            }
        } catch (error) {
            console.error('Error fetching recently viewed:', error);
        }
    };

    const checkWishlistStatus = async () => {
        try {
            const response = await checkWishlistAPI(id);
            if (response.EC === 0) {
                setIsInWishlist(response.isInWishlist);
            }
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!auth.isAuthenticated) {
            messageApi.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }

        setCartLoading(true);
        try {
            await addToCart({
                variables: { productId: id, quantity }
            });
            messageApi.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            messageApi.error(error.message || 'Lỗi thêm vào giỏ hàng');
        } finally {
            setCartLoading(false);
        }
    };

    const handleWishlistToggle = async () => {
        if (!auth.isAuthenticated) {
            messageApi.warning('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
            navigate('/login');
            return;
        }

        setWishlistLoading(true);
        try {
            if (isInWishlist) {
                const response = await removeFromWishlistAPI(id);
                if (response.EC === 0) {
                    setIsInWishlist(false);
                    messageApi.success('Đã xóa khỏi danh sách yêu thích');
                }
            } else {
                const response = await addToWishlistAPI(id);
                if (response.EC === 0) {
                    setIsInWishlist(true);
                    messageApi.success('Đã thêm vào danh sách yêu thích');
                }
            }
        } catch (error) {
            messageApi.error('Lỗi cập nhật danh sách yêu thích');
        } finally {
            setWishlistLoading(false);
        }
    };

    const loadMoreReviews = async () => {
        if (reviewsLoading || !hasMoreReviews) return;

        setReviewsLoading(true);
        try {
            const response = await getProductReviewsAPI(id, reviewPage + 1, 10);
            if (response.EC === 0) {
                setReviews(prev => [...prev, ...response.reviews]);
                setReviewPage(prev => prev + 1);
                setHasMoreReviews(response.pagination.page < response.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error loading more reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleSubmitReview = async (values) => {
        if (!auth.isAuthenticated) {
            messageApi.warning('Vui lòng đăng nhập để đánh giá');
            navigate('/login');
            return;
        }

        setSubmittingReview(true);
        try {
            const response = await createReviewAPI(id, values);
            if (response.EC === 0) {
                messageApi.success('Đánh giá của bạn đã được gửi');
                setReviewModalOpen(false);
                reviewForm.resetFields();
                // Refresh reviews
                const reviewsRes = await getProductReviewsAPI(id, 1, 10);
                if (reviewsRes.EC === 0) {
                    setReviews(reviewsRes.reviews);
                    setReviewStats(reviewsRes.stats);
                }
            } else {
                messageApi.error(response.EM || 'Lỗi gửi đánh giá');
            }
        } catch (error) {
            messageApi.error('Lỗi gửi đánh giá');
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="product-detail-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-empty">
                <Empty description="Không tìm thấy sản phẩm" />
            </div>
        );
    }

    const tabItems = [
        {
            key: 'description',
            label: 'Mô tả sản phẩm',
            children: (
                <div className="product-description">
                    <p>{product.description}</p>
                </div>
            )
        },
        {
            key: 'reviews',
            label: `Đánh giá (${reviewStats?.totalReviews || 0})`,
            children: (
                <div className="product-reviews">
                    <div className="review-summary">
                        <div className="review-average">
                            <div className="average-score">{(reviewStats?.avgRating || 0).toFixed(1)}</div>
                            <Rate disabled value={reviewStats?.avgRating || 0} />
                            <div className="total-reviews">{reviewStats?.totalReviews || 0} đánh giá</div>
                        </div>
                        <div className="review-breakdown">
                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="rating-row">
                                    <span>{star} sao</span>
                                    <Progress 
                                        percent={reviewStats?.totalReviews ? 
                                            (reviewStats[`rating${star}`] / reviewStats.totalReviews * 100) : 0} 
                                        showInfo={false}
                                        strokeColor="#fadb14"
                                    />
                                    <span>{reviewStats?.[`rating${star}`] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {auth.isAuthenticated && (
                        <Button 
                            type="primary" 
                            onClick={() => setReviewModalOpen(true)}
                            style={{ marginBottom: 16 }}
                        >
                            Viết đánh giá
                        </Button>
                    )}

                    <div className="reviews-list">
                        {reviews.length === 0 ? (
                            <Empty description="Chưa có đánh giá nào" />
                        ) : (
                            reviews.map(review => (
                                <div key={review._id} className="review-item">
                                    <div className="review-header">
                                        <Avatar icon={<UserOutlined />} />
                                        <div className="review-info">
                                            <div className="reviewer-name">
                                                {review.user?.name || 'Ẩn danh'}
                                                {review.isVerifiedPurchase && (
                                                    <span className="verified-badge">
                                                        <CheckCircleOutlined /> Đã mua hàng
                                                    </span>
                                                )}
                                            </div>
                                            <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                                        </div>
                                        <div className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    <div className="review-content">{review.comment}</div>
                                </div>
                            ))
                        )}

                        {hasMoreReviews && (
                            <Button 
                                onClick={loadMoreReviews} 
                                loading={reviewsLoading}
                                style={{ marginTop: 16 }}
                            >
                                Xem thêm đánh giá
                            </Button>
                        )}
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="product-detail-page">
            {contextHolder}

            <div className="product-detail-container">
                <div className="product-image-section">
                    <img src={product.image} alt={product.name} className="product-main-image" />
                </div>

                <div className="product-info-section">
                    <h1 className="product-title">{product.name}</h1>
                    
                    <div className="product-rating">
                        <Rate disabled value={stats.avgRating} />
                        <span className="rating-text">({reviewStats?.totalReviews || 0} đánh giá)</span>
                        <span className="divider">|</span>
                        <span className="buyers-count">{stats.buyersCount} đã mua</span>
                    </div>

                    <div className="product-price">{formatPrice(product.price)}</div>

                    <div className="product-stats">
                        <span className="stat-item">
                            <UserOutlined /> {stats.viewCount} lượt xem
                        </span>
                        <span className="stat-item">
                            <ShoppingCartOutlined /> {stats.buyersCount} đã mua
                        </span>
                    </div>

                    <div className="product-category">
                        Danh mục: <span>{product.category}</span>
                    </div>

                    <div className="product-stock">
                        Kho: <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                        </span>
                    </div>

                    <div className="product-quantity">
                        <span>Số lượng:</span>
                        <InputNumber
                            min={1}
                            max={product.stock}
                            value={quantity}
                            onChange={setQuantity}
                            disabled={product.stock === 0}
                        />
                    </div>

                    <div className="product-actions">
                        <Button
                            type="primary"
                            size="large"
                            icon={<ShoppingCartOutlined />}
                            onClick={handleAddToCart}
                            loading={cartLoading}
                            disabled={product.stock === 0}
                        >
                            Thêm vào giỏ hàng
                        </Button>
                        <Button
                            size="large"
                            icon={isInWishlist ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                            onClick={handleWishlistToggle}
                            loading={wishlistLoading}
                        >
                            {isInWishlist ? 'Đã yêu thích' : 'Yêu thích'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="product-tabs">
                <Tabs items={tabItems} />
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="product-section">
                    <h2 className="section-title">Sản phẩm tương tự</h2>
                    <div className="products-grid">
                        {similarProducts.map(p => (
                            <Link to={`/products/${p._id}`} key={p._id} className="product-card-link">
                                <div className="product-card">
                                    <img src={p.image} alt={p.name} />
                                    <div className="product-card-info">
                                        <h4>{p.name}</h4>
                                        <div className="product-card-price">{formatPrice(p.price)}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
                <div className="product-section">
                    <h2 className="section-title">Sản phẩm đã xem</h2>
                    <div className="products-grid">
                        {recentlyViewed.map(p => (
                            <Link to={`/products/${p._id}`} key={p._id} className="product-card-link">
                                <div className="product-card">
                                    <img src={p.image} alt={p.name} />
                                    <div className="product-card-info">
                                        <h4>{p.name}</h4>
                                        <div className="product-card-price">{formatPrice(p.price)}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <Modal
                title="Viết đánh giá"
                open={reviewModalOpen}
                onCancel={() => setReviewModalOpen(false)}
                footer={null}
            >
                <Form form={reviewForm} onFinish={handleSubmitReview} layout="vertical">
                    <Form.Item
                        name="rating"
                        label="Đánh giá"
                        rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
                    >
                        <Rate />
                    </Form.Item>
                    <Form.Item
                        name="comment"
                        label="Nhận xét"
                        rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
                    >
                        <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..." />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={submittingReview} block>
                            Gửi đánh giá
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductDetailPage;
