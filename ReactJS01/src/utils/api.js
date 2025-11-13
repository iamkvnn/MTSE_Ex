import axios from './axios.customize';

const createUserApi = (email, name, pass) => {
    const URL = '/api/v1/register';
    const data = { email, name, password: pass };
    return axios.post(URL, data);
}

const logiApi = (email, pass) => {
    const URL = '/api/v1/login';
    const data = { email, password: pass };
    return axios.post(URL, data);
}

const getUserApi = () => {
    const URL = `/api/v1/user`;
    return axios.get(URL);
}

export {
    createUserApi,
    logiApi,
    getUserApi
}