import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, SettingOutlined, UserOutlined, ShoppingOutlined, DashboardOutlined, ShoppingCartOutlined, HeartOutlined, OrderedListOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/auth.context';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);

    const items = [
        {
            label: <Link to="/">Home Page</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to="/products">Products</Link>,
            key: 'products',
            icon: <ShoppingOutlined />,
        },
        ...(auth.isAuthenticated ? [
            {
                label: <Link to="/cart">Cart</Link>,
                key: 'cart',
                icon: <ShoppingCartOutlined />,
            },
            {
                label: <Link to="/wishlist">Wishlist</Link>,
                key: 'wishlist',
                icon: <HeartOutlined />,
            },
            {
                label: <Link to="/orders">Orders</Link>,
                key: 'orders',
                icon: <OrderedListOutlined />,
            }
        ] : []),
        ...(auth.isAuthenticated && auth.user.role === 'Admin' ? [
            {
                label: <Link to="/user">User</Link>,
                key: 'user',
                icon: <UserOutlined />,
            },
            {
                label: 'Admin',
                key: 'admin-submenu',
                icon: <DashboardOutlined />,
                children: [
                    {
                        label: <Link to="/admin">Product Management</Link>,
                        key: 'admin-products',
                    },
                    {
                        label: <Link to="/admin/orders">Order Management</Link>,
                        key: 'admin-orders',
                    }
                ]
            }
        ] : []),
        {
            label: `Welcome, ${auth?.user?.name ?? ''}`,
            key: 'submenu',
            icon: <SettingOutlined />,
            children: [
                ...(auth.isAuthenticated ? [
                    {
                        label: <span onClick={() => {
                            localStorage.clear('access_token');
                            setCurrent('home');
                            setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
                            navigate('/');
                        }}>Đăng xuất</span>,
                        key: 'logout',
                    }
                ]: [
                    {
                        label: <Link to="/login">Đăng nhập</Link>,
                        key: 'login',
                    }
                ])
            ]
        }
    ];
    const [current, setCurrent] = useState('mail');

    const onClick = (e) => {
        setCurrent(e.key);
    }

    return (
        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
    );
}

export default Header;