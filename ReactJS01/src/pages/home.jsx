import { Result } from 'antd';
import { CrownOutlined } from '@ant-design/icons';

const HomePage = () => {
  return (
    <div style={{ padding: 20 }}>
        <Result
            icon={<CrownOutlined />}
            title="JSON Web Token (JWT) Authentication with Node.js and React.js"
        />
    </div>
    );
};

export default HomePage;