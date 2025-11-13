import bcrypt from 'bcryptjs';
import { User } from '../model/user.js';
import jwt from 'jsonwebtoken';
const salt = bcrypt.genSaltSync(10);

export const createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email: data.email });
            if (user) {
                reject('Email is already in use, please try another email!');
            }
            const hashPasswordFromBcrypt = await await bcrypt.hashSync(data.password, salt);
            const result = await User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                name: data.name,
                role: "User"
            });
            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
}

export const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: 'Email/Password không hợp lệ',
            }
        }
        const isPasswordValid = await bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return {
                EC: 2,
                EM: 'Email/Password không hợp lệ',
            }
        }
        const payload = {
            email: user.email,
            name: user.name,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return {
            EC: 0,
            token,
            user: {
                email: user.email,
                name: user.name,
            }
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const getUserService = async () => {
    try {
        const users = await User.find({}).select('-password');
        return users;
    } catch (e) {
        console.log(e);
        return [];
    }
}