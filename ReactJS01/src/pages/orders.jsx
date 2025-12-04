import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../components/context/auth.context';
import { useNavigate, Link } from 'react-router-dom';
import { message, Empty, Spin, Button, Tag, Modal, Steps, Pagination, Input } from 'antd';
import { ShoppingOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { getMyOrdersAPI, getOrderByIdAPI, cancelOrderAPI } from '../utils/api';
import '../styles/orders.css';

const { TextArea } = Input;

const OrdersPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    // Order detail modal
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // Cancel modal
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [auth.isAuthenticated, pagination.page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getMyOrdersAPI(pagination.page, pagination.limit);
            if (response.EC === 0) {
                setOrders(response.orders);
                setPagination(prev => ({ ...prev, total: response.pagination.total }));
            } else {
                messageApi.error(response.EM || 'Lỗi tải đơn hàng');
            }
        } catch (error) {
            messageApi.error('Lỗi tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (orderId) => {
        setDetailLoading(true);
        setDetailModalOpen(true);
        try {
            const response = await getOrderByIdAPI(orderId);
            if (response.EC === 0) {
                setSelectedOrder(response.order);
            } else {
                messageApi.error(response.EM || 'Lỗi tải chi tiết đơn hàng');
            }
        } catch (error) {
            messageApi.error('Lỗi tải chi tiết đơn hàng');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCancelClick = (order) => {
        setCancellingOrder(order);
        setCancelModalOpen(true);
    };

    const handleCancelConfirm = async () => {
        if (!cancelReason.trim()) {
            messageApi.warning('Vui lòng nhập lý do hủy đơn');
            return;
        }

        setCancelLoading(true);
        try {
            const response = await cancelOrderAPI(cancellingOrder._id, cancelReason);
            if (response.EC === 0) {
                messageApi.success('Đơn hàng đã được hủy');
                setCancelModalOpen(false);
                setCancelReason('');
                setCancellingOrder(null);
                fetchOrders();
            } else {
                messageApi.error(response.EM || 'Lỗi hủy đơn hàng');
            }
        } catch (error) {
            messageApi.error('Lỗi hủy đơn hàng');
        } finally {
            setCancelLoading(false);
        }
    };

    const getStatusTag = (status) => {
        const statusMap = {
            pending: { color: 'orange', text: 'Chờ xác nhận' },
            confirmed: { color: 'blue', text: 'Đã xác nhận' },
            processing: { color: 'cyan', text: 'Đang xử lý' },
            shipping: { color: 'purple', text: 'Đang giao hàng' },
            delivered: { color: 'green', text: 'Đã giao hàng' },
            cancelled: { color: 'red', text: 'Đã hủy' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
    };

    const getStatusStep = (status) => {
        const steps = ['pending', 'confirmed', 'processing', 'shipping', 'delivered'];
        if (status === 'cancelled') return -1;
        return steps.indexOf(status);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('vi-VN');
    };

    if (loading && orders.length === 0) {
        return (
            <div className="orders-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="orders-page">
            {contextHolder}

            <div className="orders-header">
                <h1>
                    <ShoppingOutlined /> Đơn hàng của tôi
                </h1>
            </div>

            {orders.length === 0 ? (
                <Empty
                    description="Bạn chưa có đơn hàng nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => navigate('/products')}>
                        Mua sắm ngay
                    </Button>
                </Empty>
            ) : (
                <>
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-info">
                                        <span className="order-id">Đơn hàng #{order._id.slice(-8).toUpperCase()}</span>
                                        <span className="order-date">{formatDate(order.createdAt)}</span>
                                    </div>
                                    {getStatusTag(order.status)}
                                </div>

                                <div className="order-items-preview">
                                    {order.items.slice(0, 3).map(item => (
                                        <div key={item._id} className="order-item-preview">
                                            <img src={item.product?.image} alt={item.product?.name} />
                                            <div className="item-info">
                                                <span className="item-name">{item.product?.name}</span>
                                                <span className="item-qty">x{item.quantity}</span>
                                            </div>
                                            <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="more-items">
                                            +{order.items.length - 3} sản phẩm khác
                                        </div>
                                    )}
                                </div>

                                <div className="order-card-footer">
                                    <div className="order-total">
                                        Tổng tiền: <strong>{formatPrice(order.totalAmount)}</strong>
                                    </div>
                                    <div className="order-actions">
                                        <Button 
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewDetail(order._id)}
                                        >
                                            Chi tiết
                                        </Button>
                                        {['pending', 'confirmed'].includes(order.status) && (
                                            <Button 
                                                danger
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => handleCancelClick(order)}
                                            >
                                                Hủy đơn
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="orders-pagination">
                        <Pagination
                            current={pagination.page}
                            total={pagination.total}
                            pageSize={pagination.limit}
                            onChange={(page) => setPagination(prev => ({ ...prev, page }))}
                            showTotal={(total) => `Tổng ${total} đơn hàng`}
                        />
                    </div>
                </>
            )}

            {/* Order Detail Modal */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?._id?.slice(-8).toUpperCase()}`}
                open={detailModalOpen}
                onCancel={() => setDetailModalOpen(false)}
                footer={null}
                width={700}
            >
                {detailLoading ? (
                    <div className="modal-loading"><Spin /></div>
                ) : selectedOrder ? (
                    <div className="order-detail">
                        <div className="order-status-timeline">
                            {selectedOrder.status === 'cancelled' ? (
                                <div className="cancelled-notice">
                                    <Tag color="red" style={{ fontSize: 14 }}>Đơn hàng đã bị hủy</Tag>
                                    {selectedOrder.cancelReason && (
                                        <p className="cancel-reason">Lý do: {selectedOrder.cancelReason}</p>
                                    )}
                                </div>
                            ) : (
                                <Steps
                                    current={getStatusStep(selectedOrder.status)}
                                    size="small"
                                    items={[
                                        { title: 'Chờ xác nhận' },
                                        { title: 'Đã xác nhận' },
                                        { title: 'Đang xử lý' },
                                        { title: 'Đang giao' },
                                        { title: 'Đã giao' }
                                    ]}
                                />
                            )}
                        </div>

                        <div className="order-detail-section">
                            <h4>Thông tin giao hàng</h4>
                            <p><strong>{selectedOrder.shippingAddress.fullName}</strong></p>
                            <p>{selectedOrder.shippingAddress.phone}</p>
                            <p>{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}</p>
                            {selectedOrder.shippingAddress.note && (
                                <p>Ghi chú: {selectedOrder.shippingAddress.note}</p>
                            )}
                        </div>

                        <div className="order-detail-section">
                            <h4>Sản phẩm</h4>
                            <div className="order-items-list">
                                {selectedOrder.items.map(item => (
                                    <div key={item._id} className="order-item">
                                        <Link to={`/products/${item.product?._id}`}>
                                            <img src={item.product?.image} alt={item.product?.name} />
                                        </Link>
                                        <div className="item-details">
                                            <Link to={`/products/${item.product?._id}`}>
                                                {item.product?.name}
                                            </Link>
                                            <span>Số lượng: {item.quantity}</span>
                                            <span>Đơn giá: {formatPrice(item.price)}</span>
                                        </div>
                                        <div className="item-total">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="order-detail-summary">
                            <div className="summary-row">
                                <span>Phương thức thanh toán:</span>
                                <span>{selectedOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : selectedOrder.paymentMethod}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Tổng tiền:</span>
                                <span>{formatPrice(selectedOrder.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Modal>

            {/* Cancel Order Modal */}
            <Modal
                title="Hủy đơn hàng"
                open={cancelModalOpen}
                onCancel={() => {
                    setCancelModalOpen(false);
                    setCancelReason('');
                    setCancellingOrder(null);
                }}
                onOk={handleCancelConfirm}
                okText="Xác nhận hủy"
                cancelText="Đóng"
                confirmLoading={cancelLoading}
                okButtonProps={{ danger: true }}
            >
                <p>Bạn có chắc muốn hủy đơn hàng này?</p>
                <TextArea
                    placeholder="Nhập lý do hủy đơn hàng..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                />
            </Modal>
        </div>
    );
};

export default OrdersPage;
