import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../components/context/auth.context';
import { useNavigate, Link } from 'react-router-dom';
import { message, Empty, Spin, Button, Popconfirm } from 'antd';
import { useMutation } from '@apollo/client/react';
import { ADD_TO_CART } from '../graphql/cartQueries';
import { DeleteOutlined, ShoppingCartOutlined, HeartFilled } from '@ant-design/icons';
import { getWishlistAPI, removeFromWishlistAPI, clearWishlistAPI } from '../utils/api';
import '../styles/wishlist.css';

const WishlistPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    const [addToCart] = useMutation(ADD_TO_CART);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchWishlist();
    }, [auth.isAuthenticated]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const response = await getWishlistAPI();
            if (response.EC === 0) {
                setWishlist(response.wishlist);
            } else {
                messageApi.error(response.EM || 'Lỗi tải danh sách yêu thích');
            }
        } catch (error) {
            messageApi.error('Lỗi tải danh sách yêu thích');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        setActionLoading(prev => ({ ...prev, [productId]: true }));
        try {
            const response = await removeFromWishlistAPI(productId);
            if (response.EC === 0) {
                setWishlist(response.wishlist);
                messageApi.success('Đã xóa khỏi danh sách yêu thích');
            } else {
                messageApi.error(response.EM || 'Lỗi xóa sản phẩm');
            }
        } catch (error) {
            messageApi.error('Lỗi xóa sản phẩm');
        } finally {
            setActionLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleClearWishlist = async () => {
        try {
            const response = await clearWishlistAPI();
            if (response.EC === 0) {
                setWishlist({ products: [] });
                messageApi.success('Đã xóa toàn bộ danh sách yêu thích');
            } else {
                messageApi.error(response.EM || 'Lỗi xóa danh sách');
            }
        } catch (error) {
            messageApi.error('Lỗi xóa danh sách');
        }
    };

    const handleAddToCart = async (productId) => {
        setActionLoading(prev => ({ ...prev, [`cart_${productId}`]: true }));
        try {
            await addToCart({
                variables: { productId, quantity: 1 }
            });
            messageApi.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            messageApi.error(error.message || 'Lỗi thêm vào giỏ hàng');
        } finally {
            setActionLoading(prev => ({ ...prev, [`cart_${productId}`]: false }));
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
            <div className="wishlist-loading">
                <Spin size="large" />
            </div>
        );
    }

    const products = wishlist?.products || [];

    return (
        <div className="wishlist-page">
            {contextHolder}

            <div className="wishlist-header">
                <h1>
                    <HeartFilled style={{ color: '#ff4d4f' }} /> Sản phẩm yêu thích
                </h1>
                {products.length > 0 && (
                    <Popconfirm
                        title="Xóa tất cả sản phẩm yêu thích?"
                        onConfirm={handleClearWishlist}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger>Xóa tất cả</Button>
                    </Popconfirm>
                )}
            </div>

            {products.length === 0 ? (
                <Empty
                    description="Bạn chưa có sản phẩm yêu thích nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => navigate('/products')}>
                        Khám phá sản phẩm
                    </Button>
                </Empty>
            ) : (
                <div className="wishlist-grid">
                    {products.map(item => (
                        <div key={item.product._id} className="wishlist-item">
                            <Link to={`/products/${item.product._id}`} className="wishlist-item-link">
                                <img src={item.product.image} alt={item.product.name} />
                                <div className="wishlist-item-info">
                                    <h3>{item.product.name}</h3>
                                    <div className="wishlist-item-price">{formatPrice(item.product.price)}</div>
                                    <div className={`wishlist-item-stock ${item.product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {item.product.stock > 0 ? `Còn ${item.product.stock} sản phẩm` : 'Hết hàng'}
                                    </div>
                                </div>
                            </Link>
                            <div className="wishlist-item-actions">
                                <Button
                                    type="primary"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={() => handleAddToCart(item.product._id)}
                                    loading={actionLoading[`cart_${item.product._id}`]}
                                    disabled={item.product.stock === 0}
                                >
                                    Thêm vào giỏ
                                </Button>
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemove(item.product._id)}
                                    loading={actionLoading[item.product._id]}
                                >
                                    Xóa
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
