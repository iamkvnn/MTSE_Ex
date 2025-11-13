import { createUserApi } from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import { notification, Button, Row, Col, Divider, Form, Input } from "antd";

const RegisterPage = () => {
    const navigate = useNavigate();
    const onFinish = async (values) => {
        const { email, password, name } = values;
        const res = await createUserApi(email, name, password);

        if (res) {
            notification.success({
                message: 'CREATE USER',
                description: 'Success'
            });
            navigate('/login');
        } else {
            notification.error({
                message: 'CREATE USER',
                description: 'Error'
            });
        }
    };

    return (
        <Row justify="center" style={{ marginTop: '30px' }}>
            <Col xs={24} md={16} lg={8}>
                <fieldset style={{
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    padding: '15px',
                    margin: '5px'
                }}>
                    <legend>Đăng ký tài khoản</legend>
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Please input your email!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input your name!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                    <Link to="/">Quay lại trang chủ</Link>
                    <Divider />
                    <div style={{ textAlign: 'center' }}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                </fieldset>
            </Col>
        </Row>
    );
}

export default RegisterPage;
