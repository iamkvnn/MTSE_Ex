import bcrypt from 'bcryptjs';
import { User } from '../models/user';

const salt = bcrypt.genSaltSync(10);

export const createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password) ;
            await User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,
            });
            resolve('OK create a new user successfull!');
        } catch (e) {
            reject(e);
        }
    });
}

export const hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        }
        catch (e) {
            reject(e);
        }
    });
}

export const getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = User.findAll({
                raw: true,
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
}

export const getUserInfoById = (userId) =>  {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({
                where: {id: userId},
                raw: true
            });
            if (user) {
                resolve(user);
            } else {
                resolve([])
            }
        }
        catch (e) {
            reject(e)
        }
    })
}

export const updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({
                where: {id: data.id}
            });
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                await user.save();
                let allUsers = await User.findAll();
                resolve(allUsers);
            } else {
                resolve([]);
            }
        } catch (e) {
            reject(e);
        }
    });
}

export const deleteUserById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await User.findOne({
                where: {id: userId}
            });
            if (user) {
                await user.destroy();
            }
            resolve('User not found!');
        } catch (e) {
            reject(e);
        }
    });
}
