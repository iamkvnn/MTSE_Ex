import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, SettingOutlined, UserOutlined, ShoppingOutlined, DashboardOutlined } from '@ant-design/icons';
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
        ...(auth.isAuthenticated && auth.user.role === 'Admin' ? [
            {
                label: <Link to="/user">User</Link>,
                key: 'user',
                icon: <UserOutlined />,
            }
        ] : []),
        ...(auth.isAuthenticated && auth.user.role === 'Admin' ? [
            {
                label: <Link to="/admin">Admin Dashboard</Link>,
                key: 'admin',
                icon: <DashboardOutlined />,
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