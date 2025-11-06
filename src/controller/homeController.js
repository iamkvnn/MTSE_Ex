import CRUDService from '../services/CRUDService';

let getHomePage = async (req, res) => {
    try {
        let data = await CRUDService.getAllUser();
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

let getAboutPage = (req, res) => {
    return res.render('test/about.ejs');
};

let getCRUD = (req, res) => {
    return res.render('crud.ejs');
};

let getFindAllCrud = async (req, res) => {
    let data = await CRUDService.getAllUser();
    return res.render('users/findAllUser.ejs', {
        dataList: data
    });
}

let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    return res.send('post crud from server');
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (!userId) {
        return res.send('Không lấy được id');
    }
    let userData = await CRUDService.getUserInfoById(userId);
    return res.render('users/updateUser.ejs', {
        data: userData
    });
}

let putCRUD = async (req, res) => {
    let data = req.body;
    let allUsers = await CRUDService.updateUser(data);
    return res.render('users/findAllUser.ejs', {
        dataList: allUsers
    });
}

let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    if (!id) {
        return res.send('Không lấy được id');
    }
    await CRUDService.deleteUserById(id);
    return res.send('Deleted!');
}

module.exports = {
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    getFindAllCrud: getFindAllCrud,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD
};