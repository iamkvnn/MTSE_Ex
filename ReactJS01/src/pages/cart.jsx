import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/context/auth.context';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CART, UPDATE_CART_ITEM, REMOVE_FROM_CART, CLEAR_CART } from '../graphql/cartQueries';
import { message, Empty, Card, Spin, Checkbox, Button, InputNumber, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import '../styles/cart.css';

const CartPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [selectedItems, setSelectedItems] = useState([]);
    const [actionLoading, setActionLoading] = useState({});

    // GraphQL queries and mutations
    const { loading, data, refetch } = useQuery(GET_CART, {
        skip: !auth.isAuthenticated,
        fetchPolicy: 'network-only'
    });

    const [updateCartItem] = useMutation(UPDATE_CART_ITEM);
    const [removeFromCart] = useMutation(REMOVE_FROM_CART);
    const [clearCart] = useMutation(CLEAR_CART);

    const cart = data?.getCart;

    useEffect(() => {
        if (cart?.items) {
            setSelectedItems(cart.items.map(item => item.product._id));
        }
    }, [cart]);

    const handleQuantityChange = async (productId, quantity) => {
        setActionLoading(prev => ({ ...prev, [productId]: true }));
        try {
            await updateCartItem({
                variables: { productId, quantity }
            });
            messageApi.success('Đã cập nhật số lượng');
        } catch (error) {
            messageApi.error(error.message || 'Lỗi cập nhật số lượng');
        } finally {
            setActionLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleRemove = async (productId) => {
        setActionLoading(prev => ({ ...prev, [productId]: true }));
        try {
            await removeFromCart({
                variables: { productId }
            });
            setSelectedItems(prev => prev.filter(id => id !== productId));
            messageApi.success('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            messageApi.error(error.message || 'Lỗi xóa sản phẩm');
        } finally {
            setActionLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
            setSelectedItems([]);
            messageApi.success('Đã xóa toàn bộ giỏ hàng');
        } catch (error) {
            messageApi.error(error.message || 'Lỗi xóa giỏ hàng');
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(cart.items.map(item => item.product._id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (productId, checked) => {
        if (checked) {
            setSelectedItems(prev => [...prev, productId]);
        } else {
            setSelectedItems(prev => prev.filter(id => id !== productId));
        }
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            messageApi.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            return;
        }
        navigate('/checkout', { state: { selectedItems } });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items
            .filter(item => selectedItems.includes(item.product._id))
            .reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const calculateSelectedCount = () => {
        return selectedItems.length;
    };

    // Check authentication
    if (!auth.isAuthenticated) {
        return (
            <div className="cart-page">
                {contextHolder}
                <Card>
                    <Empty
                        description="Vui lòng đăng nhập để xem giỏ hàng"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </Button>
                    </Empty>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="cart-page">
                <div className="cart-loading">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    const items = cart?.items || [];

    return (
        <div className="cart-page">
            {contextHolder}

            <div className="cart-header">
                <h1>
                    <ShoppingOutlined /> Giỏ hàng của bạn
                </h1>
                {items.length > 0 && (
                    <Popconfirm
                        title="Xóa tất cả sản phẩm trong giỏ hàng?"
                        onConfirm={handleClearCart}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger>Xóa tất cả</Button>
                    </Popconfirm>
                )}
            </div>

            {items.length === 0 ? (
                <Card>
                    <Empty
                        description="Giỏ hàng trống"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => navigate('/products')}>
                            Mua sắm ngay
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <div className="cart-container">
                    <div className="cart-items-section">
                        <Card className="cart-items-card">
                            <div className="cart-select-all">
                                <Checkbox
                                    checked={selectedItems.length === items.length}
                                    indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                >
                                    Chọn tất cả ({items.length} sản phẩm)
                                </Checkbox>
                            </div>

                            <div className="cart-items-list">
                                {items.map(item => (
                                    <div key={item.product._id} className="cart-item">
                                        <Checkbox
                                            checked={selectedItems.includes(item.product._id)}
                                            onChange={(e) => handleSelectItem(item.product._id, e.target.checked)}
                                        />
                                        <img 
                                            src={item.product.image} 
                                            alt={item.product.name}
                                            onClick={() => navigate(`/products/${item.product._id}`)}
                                        />
                                        <div className="cart-item-info">
                                            <h4 onClick={() => navigate(`/products/${item.product._id}`)}>
                                                {item.product.name}
                                            </h4>
                                            <div className="cart-item-price">
                                                {formatPrice(item.product.price)}
                                            </div>
                                            <div className={`cart-item-stock ${item.product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                {item.product.stock > 0 ? `Còn ${item.product.stock} sản phẩm` : 'Hết hàng'}
                                            </div>
                                        </div>
                                        <div className="cart-item-quantity">
                                            <InputNumber
                                                min={1}
                                                max={item.product.stock}
                                                value={item.quantity}
                                                onChange={(value) => handleQuantityChange(item.product._id, value)}
                                                disabled={actionLoading[item.product._id]}
                                            />
                                        </div>
                                        <div className="cart-item-total">
                                            {formatPrice(item.product.price * item.quantity)}
                                        </div>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemove(item.product._id)}
                                            loading={actionLoading[item.product._id]}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="cart-summary-section">
                        <Card className="cart-summary-card">
                            <h3>Tổng đơn hàng</h3>
                            <div className="summary-row">
                                <span>Số sản phẩm đã chọn:</span>
                                <span>{calculateSelectedCount()}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(calculateTotal())}</span>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={handleCheckout}
                                disabled={selectedItems.length === 0}
                            >
                                Mua hàng ({calculateSelectedCount()})
                            </Button>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
