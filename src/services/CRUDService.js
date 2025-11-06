import bcrypt from 'bcryptjs';
const User = require('../models/user');
const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
            });
            resolve('OK create a new user successfull!');
        } catch (e) {
            reject(e);
        }
    });
}

let hashUserPassword = (password) => {
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

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = User.find({
                raw: true,
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
}

let getUserInfoById = (userId) =>  {
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

let updateUser = (data) => {
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
                let allUsers = await User.find();
                resolve(allUsers);
            } else {
                resolve();
            }
        } catch (e) {
            reject(e);
        }
    });
}

let deleteUserById = (userId) => {
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

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getUserInfoById: getUserInfoById,
    updateUser: updateUser,
    deleteUserById: deleteUserById
}
