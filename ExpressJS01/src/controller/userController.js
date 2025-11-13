import { createNewUser, loginUser, getUserService } from "../service/UserService.js";

export const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    return res.status(200).json(
        await createNewUser({ name, email, password })    
    );
}

export const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    return res.status(200).json(
        await loginUser(email, password)
    );
}

export const getUser = async (req, res) => {
    return res.status(200).json(
        await getUserService()
    );
}

export const getAccount = async (req, res) => {
    return res.status(200).json(req.user);
}