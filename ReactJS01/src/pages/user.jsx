import { getUserApi } from "../utils/api";
import { useEffect, useState } from "react";
import { notification, Table } from "antd";

const UserPage = () => {
    const [ dataSource, setDataSource ] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getUserApi();
            if (!response?.message) {
                setDataSource(response);
            } else {
                notification.error({
                    message: 'Unathorized',
                    decription: response.message
                });
            }
        };
        fetchData();
    }, []);
    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Role',
            dataIndex: 'role',
        },
    ];
    return (
        <div style={{ padding: 20 }}>
            <Table
                bordered
                dataSource={dataSource}
                columns={columns}
                rowKey="_id"
            />
        </div>
    );
};

export default UserPage;