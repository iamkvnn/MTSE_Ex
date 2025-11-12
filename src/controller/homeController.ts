import { Request, Response } from "express";
import { createNewUser, deleteUserById, getAllUser, getUserInfoById, updateUser } from "../services/CRUDService";


export const getHomePage = async (req: Request, res: Response) => {
    try {
        let data = await getAllUser();
        console.log('-------------------');
        console.log(data);
        console.log('-------------------');
        return res.render('homepage.ejs', { 
            data: JSON.stringify(data) 
        });
    } catch (error) {
        console.error(error);
    }
};

export const getAboutPage = (req: Request, res: Response) => {
    return res.render('test/about.ejs');
};

export const getCRUD = (req: Request, res: Response) => {
    return res.render('crud.ejs');
};

export const getFindAllCrud = async (req: Request, res: Response) => {
    let data = await getAllUser();
    return res.render('users/findAllUser.ejs', {
        dataList: data
    });
}

export const postCRUD = async (req: Request, res: Response) => {
    let message = await createNewUser(req.body);
    console.log(message);
    return res.send('post crud from server');
}

export const getEditCRUD = async (req: Request, res: Response) => {
    let userId = req.query.id;
    if (!userId) {
        return res.send('Không lấy được id');
    }
    let userData = await getUserInfoById(userId);
    return res.render('users/updateUser.ejs', {
        data: userData
    });
}

export const putCRUD = async (req: Request, res: Response) => {
    let data = req.body;
    let allUsers = await updateUser(data);
    return res.render('users/findAllUser.ejs', {
        dataList: allUsers
    });
}

export const deleteCRUD = async (req: Request, res: Response) => {
    let id = req.query.id;
    if (!id) {
        return res.send('Không lấy được id');
    }
    await deleteUserById(id);
    return res.send('Deleted!');
}