import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../components/context/auth.context';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_CART } from '../graphql/cartQueries';
import { message, Button, Form, Input, Radio, Spin, Empty, Steps, Card, Divider } from 'antd';
import { EnvironmentOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { createOrderAPI } from '../utils/api';
import '../styles/checkout.css';

const { TextArea } = Input;

const CheckoutPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const [submitting, setSubmitting] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);

    // Get selected items from navigation state or load from cart
    const selectedItemIds = location.state?.selectedItems || [];

    // GraphQL query for cart
    const { loading, data, error } = useQuery(GET_CART, {
        skip: !auth.isAuthenticated,
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
    }, [auth.isAuthenticated]);

    useEffect(() => {
        if (data?.getCart) {
            const items = data.getCart.items || [];
            // If specific items are selected, filter them
            if (selectedItemIds.length > 0) {
                setCartItems(items.filter(item => selectedItemIds.includes(item.product._id)));
            } else {
                setCartItems(items);
            }
        }
    }, [data]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    const handleSubmitOrder = async (values) => {
        if (cartItems.length === 0) {
            messageApi.warning('Giỏ hàng trống');
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    fullName: values.fullName,
                    phone: values.phone,
                    address: values.address,
                    city: values.city,
                    district: values.district,
                    ward: values.ward,
                    note: values.note
                },
                paymentMethod: values.paymentMethod
            };

            const response = await createOrderAPI(orderData);
            if (response.EC === 0) {
                setCreatedOrder(response.order);
                setOrderSuccess(true);
                setCurrentStep(2);
            } else {
                messageApi.error(response.EM || 'Lỗi tạo đơn hàng');
            }
        } catch (error) {
            messageApi.error('Lỗi tạo đơn hàng');
        } finally {
            setSubmitting(false);
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
            <div className="checkout-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (cartItems.length === 0 && !orderSuccess) {
        return (
            <div className="checkout-page">
                <Empty
                    description="Không có sản phẩm để thanh toán"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => navigate('/cart')}>
                        Quay lại giỏ hàng
                    </Button>
                </Empty>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div className="checkout-page">
                {contextHolder}
                <div className="order-success">
                    <CheckCircleOutlined className="success-icon" />
                    <h2>Đặt hàng thành công!</h2>
                    <p>Mã đơn hàng: <strong>#{createdOrder?._id?.slice(-8).toUpperCase()}</strong></p>
                    <p>Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                    <div className="success-actions">
                        <Button type="primary" onClick={() => navigate('/orders')}>
                            Xem đơn hàng
                        </Button>
                        <Button onClick={() => navigate('/products')}>
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {contextHolder}

            <div className="checkout-steps">
                <Steps
                    current={currentStep}
                    items={[
                        { title: 'Thông tin giao hàng', icon: <EnvironmentOutlined /> },
                        { title: 'Thanh toán', icon: <CreditCardOutlined /> },
                        { title: 'Hoàn tất', icon: <CheckCircleOutlined /> }
                    ]}
                />
            </div>

            <div className="checkout-container">
                <div className="checkout-form-section">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmitOrder}
                        initialValues={{ paymentMethod: 'cod' }}
                        preserve={true}
                    >
                        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                            <Card title="Thông tin giao hàng" className="checkout-card">
                                <Form.Item
                                    name="fullName"
                                    label="Họ và tên"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                >
                                    <Input placeholder="Nhập họ và tên người nhận" />
                                </Form.Item>

                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                                    ]}
                                >
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>

                                <Form.Item
                                    name="city"
                                    label="Tỉnh/Thành phố"
                                    rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
                                >
                                    <Input placeholder="Nhập tỉnh/thành phố" />
                                </Form.Item>

                                <Form.Item
                                    name="district"
                                    label="Quận/Huyện"
                                >
                                    <Input placeholder="Nhập quận/huyện" />
                                </Form.Item>

                                <Form.Item
                                    name="ward"
                                    label="Phường/Xã"
                                >
                                    <Input placeholder="Nhập phường/xã" />
                                </Form.Item>

                                <Form.Item
                                    name="address"
                                    label="Địa chỉ chi tiết"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                                >
                                    <Input placeholder="Số nhà, tên đường..." />
                                </Form.Item>

                                <Form.Item
                                    name="note"
                                    label="Ghi chú"
                                >
                                    <TextArea rows={3} placeholder="Ghi chú cho đơn hàng (nếu có)" />
                                </Form.Item>

                                <Button type="primary" onClick={() => {
                                    form.validateFields(['fullName', 'phone', 'city', 'address'])
                                        .then(() => setCurrentStep(1))
                                        .catch(() => {});
                                }}>
                                    Tiếp tục
                                </Button>
                            </Card>
                        </div>

                        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                            <Card title="Phương thức thanh toán" className="checkout-card">
                                <Form.Item
                                    name="paymentMethod"
                                    rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                                >
                                    <Radio.Group className="payment-options">
                                        <Radio value="cod" className="payment-option">
                                            <div className="payment-option-content">
                                                <strong>Thanh toán khi nhận hàng (COD)</strong>
                                                <span>Thanh toán bằng tiền mặt khi nhận hàng</span>
                                            </div>
                                        </Radio>
                                        <Radio value="banking" className="payment-option">
                                            <div className="payment-option-content">
                                                <strong>Chuyển khoản ngân hàng</strong>
                                                <span>Chuyển khoản qua tài khoản ngân hàng</span>
                                            </div>
                                        </Radio>
                                        <Radio value="momo" className="payment-option">
                                            <div className="payment-option-content">
                                                <strong>Ví MoMo</strong>
                                                <span>Thanh toán qua ví điện tử MoMo</span>
                                            </div>
                                        </Radio>
                                    </Radio.Group>
                                </Form.Item>

                                <div className="checkout-buttons">
                                    <Button onClick={() => setCurrentStep(0)}>
                                        Quay lại
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={submitting}>
                                        Đặt hàng
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </Form>
                </div>

                <div className="checkout-summary-section">
                    <Card title="Đơn hàng của bạn" className="checkout-card">
                        <div className="summary-items">
                            {cartItems.map(item => (
                                <div key={item.product._id} className="summary-item">
                                    <img src={item.product.image} alt={item.product.name} />
                                    <div className="summary-item-info">
                                        <span className="summary-item-name">{item.product.name}</span>
                                        <span className="summary-item-qty">x{item.quantity}</span>
                                    </div>
                                    <span className="summary-item-price">
                                        {formatPrice(item.product.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Divider />

                        <div className="summary-row">
                            <span>Tạm tính:</span>
                            <span>{formatPrice(calculateTotal())}</span>
                        </div>
                        <div className="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span>Miễn phí</span>
                        </div>
                        <Divider />
                        <div className="summary-row total">
                            <span>Tổng cộng:</span>
                            <span>{formatPrice(calculateTotal())}</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
