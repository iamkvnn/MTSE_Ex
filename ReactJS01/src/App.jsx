import { useContext, useEffect } from 'react'
import Header from './components/layout/header.jsx'
import { AuthContext } from './components/context/auth.context';
import axios from './utils/axios.customize';
import { Spin } from 'antd';
import { Outlet } from 'react-router-dom';

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      const res = await axios.get('/api/v1/account');

      if (res && !res.message) {
        setAuth({
          isAuthenticated: true,
          user: { 
            email: res.email,
            name: res.name
          }
        });
      }
      setAppLoading(false);
    };

    fetchAccount();
  }, []);


  return (
    <div>
      {appLoading ? 
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <Spin/>
        </div> :
        <>
          <Header />
          <Outlet />
        </>
      }
    </div>
  )
}

export default App
