import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../components/context/auth.context';
import { useNavigate } from 'react-router-dom';
import { message, Table, Tag, Button, Select, Modal, Input, Card, Row, Col, Statistic, Pagination, DatePicker } from 'antd';
import { ShoppingOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getAllOrdersAPI, updateOrderStatusAPI, getOrderStatsAPI, getOrderByIdAPI } from '../utils/api';
import '../styles/adminOrders.css';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AdminOrdersPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState(null);

    // Update status modal
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [updating, setUpdating] = useState(false);

    // Detail modal
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        if (!auth.isAuthenticated || auth.user.role !== 'Admin') {
            navigate('/login');
            return;
        }
        fetchOrders();
        fetchStats();
    }, [auth.isAuthenticated, pagination.page, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrdersAPI(pagination.page, pagination.limit, statusFilter);
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

    const fetchStats = async () => {
        try {
            const response = await getOrderStatsAPI();
            if (response.EC === 0) {
                setStats(response.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleViewDetail = async (orderId) => {
        setDetailLoading(true);
        setDetailModalOpen(true);
        try {
            const response = await getOrderByIdAPI(orderId);
            if (response.EC === 0) {
                setOrderDetail(response.order);
            } else {
                messageApi.error(response.EM || 'Lỗi tải chi tiết đơn hàng');
            }
        } catch (error) {
            messageApi.error('Lỗi tải chi tiết đơn hàng');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleUpdateStatusClick = (order) => {
        setSelectedOrder(order);
        setNewStatus('');
        setCancelReason('');
        setUpdateModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!newStatus) {
            messageApi.warning('Vui lòng chọn trạng thái mới');
            return;
        }

        if (newStatus === 'cancelled' && !cancelReason.trim()) {
            messageApi.warning('Vui lòng nhập lý do hủy');
            return;
        }

        setUpdating(true);
        try {
            const response = await updateOrderStatusAPI(
                selectedOrder._id, 
                newStatus, 
                newStatus === 'cancelled' ? cancelReason : null
            );
            if (response.EC === 0) {
                messageApi.success('Cập nhật trạng thái thành công');
                setUpdateModalOpen(false);
                fetchOrders();
                fetchStats();
            } else {
                messageApi.error(response.EM || 'Lỗi cập nhật trạng thái');
            }
        } catch (error) {
            messageApi.error('Lỗi cập nhật trạng thái');
        } finally {
            setUpdating(false);
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

    const getNextStatuses = (currentStatus) => {
        const transitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['shipping', 'cancelled'],
            shipping: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: []
        };
        return transitions[currentStatus] || [];
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

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: '_id',
            render: (id) => `#${id.slice(-8).toUpperCase()}`
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => user?.name || user?.email || 'N/A'
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => formatPrice(amount)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Tag>
            )
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date)
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <div className="action-buttons">
                    <Button size="small" onClick={() => handleViewDetail(record._id)}>
                        Chi tiết
                    </Button>
                    {getNextStatuses(record.status).length > 0 && (
                        <Button 
                            size="small" 
                            type="primary"
                            onClick={() => handleUpdateStatusClick(record)}
                        >
                            Cập nhật
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="admin-orders-page">
            {contextHolder}

            <h1>Quản lý đơn hàng</h1>

            {/* Statistics */}
            {stats && (
                <Row gutter={16} className="stats-row">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng đơn hàng"
                                value={stats.totalOrders}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Doanh thu"
                                value={stats.totalRevenue}
                                precision={2}
                                prefix={<DollarOutlined />}
                                suffix="USD"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Chờ xử lý"
                                value={(stats.ordersByStatus?.pending || 0) + (stats.ordersByStatus?.confirmed || 0)}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Đã giao"
                                value={stats.ordersByStatus?.delivered || 0}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <div className="filters-section">
                <Select
                    value={statusFilter}
                    onChange={(value) => {
                        setStatusFilter(value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    style={{ width: 200 }}
                >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="pending">Chờ xác nhận</Option>
                    <Option value="confirmed">Đã xác nhận</Option>
                    <Option value="processing">Đang xử lý</Option>
                    <Option value="shipping">Đang giao hàng</Option>
                    <Option value="delivered">Đã giao hàng</Option>
                    <Option value="cancelled">Đã hủy</Option>
                </Select>
            </div>

            {/* Orders Table */}
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                loading={loading}
                pagination={false}
            />

            <div className="pagination-section">
                <Pagination
                    current={pagination.page}
                    total={pagination.total}
                    pageSize={pagination.limit}
                    onChange={(page) => setPagination(prev => ({ ...prev, page }))}
                    showTotal={(total) => `Tổng ${total} đơn hàng`}
                />
            </div>

            {/* Update Status Modal */}
            <Modal
                title="Cập nhật trạng thái đơn hàng"
                open={updateModalOpen}
                onCancel={() => setUpdateModalOpen(false)}
                onOk={handleUpdateStatus}
                confirmLoading={updating}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                {selectedOrder && (
                    <div className="update-status-form">
                        <p>Đơn hàng: <strong>#{selectedOrder._id.slice(-8).toUpperCase()}</strong></p>
                        <p>Trạng thái hiện tại: {getStatusTag(selectedOrder.status)}</p>
                        
                        <div className="form-field">
                            <label>Trạng thái mới:</label>
                            <Select
                                value={newStatus}
                                onChange={setNewStatus}
                                style={{ width: '100%' }}
                                placeholder="Chọn trạng thái"
                            >
                                {getNextStatuses(selectedOrder.status).map(status => (
                                    <Option key={status} value={status}>
                                        {status === 'confirmed' && 'Xác nhận đơn hàng'}
                                        {status === 'processing' && 'Đang xử lý'}
                                        {status === 'shipping' && 'Đang giao hàng'}
                                        {status === 'delivered' && 'Đã giao hàng'}
                                        {status === 'cancelled' && 'Hủy đơn hàng'}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {newStatus === 'cancelled' && (
                            <div className="form-field">
                                <label>Lý do hủy:</label>
                                <TextArea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    rows={3}
                                    placeholder="Nhập lý do hủy đơn hàng..."
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Order Detail Modal */}
            <Modal
                title={`Chi tiết đơn hàng #${orderDetail?._id?.slice(-8).toUpperCase()}`}
                open={detailModalOpen}
                onCancel={() => setDetailModalOpen(false)}
                footer={null}
                width={700}
            >
                {detailLoading ? (
                    <div className="modal-loading">Loading...</div>
                ) : orderDetail ? (
                    <div className="order-detail-admin">
                        <div className="detail-section">
                            <h4>Thông tin khách hàng</h4>
                            <p><strong>Tên:</strong> {orderDetail.user?.name}</p>
                            <p><strong>Email:</strong> {orderDetail.user?.email}</p>
                        </div>

                        <div className="detail-section">
                            <h4>Địa chỉ giao hàng</h4>
                            <p><strong>{orderDetail.shippingAddress.fullName}</strong></p>
                            <p>{orderDetail.shippingAddress.phone}</p>
                            <p>
                                {orderDetail.shippingAddress.address}, 
                                {orderDetail.shippingAddress.ward && ` ${orderDetail.shippingAddress.ward},`}
                                {orderDetail.shippingAddress.district && ` ${orderDetail.shippingAddress.district},`}
                                {` ${orderDetail.shippingAddress.city}`}
                            </p>
                            {orderDetail.shippingAddress.note && (
                                <p><strong>Ghi chú:</strong> {orderDetail.shippingAddress.note}</p>
                            )}
                        </div>

                        <div className="detail-section">
                            <h4>Sản phẩm</h4>
                            <div className="order-items-admin">
                                {orderDetail.items.map(item => (
                                    <div key={item._id} className="order-item-admin">
                                        <img src={item.product?.image} alt={item.product?.name} />
                                        <div className="item-info">
                                            <span className="item-name">{item.product?.name}</span>
                                            <span className="item-qty">SL: {item.quantity} x {formatPrice(item.price)}</span>
                                        </div>
                                        <span className="item-total">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="detail-section summary">
                            <div className="summary-row">
                                <span>Phương thức thanh toán:</span>
                                <span>{orderDetail.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : orderDetail.paymentMethod}</span>
                            </div>
                            <div className="summary-row">
                                <span>Trạng thái thanh toán:</span>
                                <Tag color={orderDetail.paymentStatus === 'paid' ? 'green' : 'orange'}>
                                    {orderDetail.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Tag>
                            </div>
                            <div className="summary-row total">
                                <span>Tổng tiền:</span>
                                <span>{formatPrice(orderDetail.totalAmount)}</span>
                            </div>
                        </div>

                        {orderDetail.status === 'cancelled' && orderDetail.cancelReason && (
                            <div className="detail-section cancelled">
                                <h4>Lý do hủy</h4>
                                <p>{orderDetail.cancelReason}</p>
                            </div>
                        )}
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

export default AdminOrdersPage;
