import { File } from "../models";
import Stegano from "../lib/encryptionStegano"
// Rotas GET
const getDashboard = async (req, res) => {
    const files = []
    const fileList = await File.findAll({
        attributes: ["created_at", "file_path", "file_type", "id", "type", "encryption_key", "file_original", "file_encrypted", "encryption_type"],
        where: {
            user_id: req.user.dataValues.id,
        },
        order: [
            ['created_at', 'DESC']
        ]
    });
    fileList.forEach(element => {
        files.push(element.dataValues)
    });
    res.render('page/dashboard', {dashboard: true, username: req.user.dataValues.username, email: req.user.dataValues.email, data: files});
}

const getEncrypt = (req, res) => {
    res.render('page/dashboard/encrypt', {dashboard: true, username: req.user.dataValues.username, email: req.user.dataValues.email});
}

const getStegano = async (req, res) => {
    const message = await Stegano.decrypt("decrypted/"+req.query.filename,req.query.filename.split(".")[1])
    const file = await File.findAll({
        attributes: ["message"],
        where: {
            file_original: req.query.filename
        }
    });
    res.render('page/dashboard/stegano', {dashboard: true, username: req.user.dataValues.username, email: req.user.dataValues.email, message: message == file[0].message ? message : file[0].message});
}

const getDecrypt = async (req, res) => {
    const files = []
    const fileList = await File.findAll({
        attributes: ["created_at", "file_path", "file_type", "id", "description", "file_size", "file_original", "file_encrypted"],
        where: {
            user_id: req.user.dataValues.id,
            type: "encrypt"
        },
        order: [
            ["created_at", "DESC"]
        ]
    });
    fileList.forEach(element => {
        files.push(element.dataValues)
    });
    res.render('page/dashboard/decrypt', {dashboard: true, username: req.user.dataValues.username, email: req.user.dataValues.email, data: files});
}

const getHistoryEncrypt = async (req, res) => {
    const files = []
    const fileList = await File.findAll({
        attributes: ["created_at", "file_path", "file_type", "id", "description", "file_size", "type", "encryption_key", "encryption_type", "file_original"],
        where: {
            user_id: req.user.dataValues.id,
            type: "encrypt"
        },
        order: [
            ['created_at', 'DESC']
        ]
    });
    fileList.forEach(element => {
        files.push(element.dataValues)
    });
    res.render('page/dashboard/historyEncrypt', {dashboard: true, username: req.user.dataValues.username, email: req.user.dataValues.email, data: files});
}

const getHistoryDecrypt = async (req, res) => {
    const files = []
    const fileList = await File.findAll({
        attributes: ["created_at", "file_path", "file_type", "id", "description", "file_size", "type", "encryption_key", "encryption_type", "file_original", "file_encrypted"],
        where: {
            user_id: req.user.dataValues.id,
            type: "decrypt"
        },
        order: [
            ['created_at', 'DESC']
        ]
    });
    fileList.forEach(element => {
        files.push(element.dataValues)
    });
    res.render('page/dashboard/historyDecrypt', {dashboard: true, username: req.user.dataValues.username, email: req.user.dataValues.email, data: files});
}

const getDecryptById = async (req, res) => {
    const file = await File.findByPk(req.params.id)
    if(file.type != "encrypt"){
        res.redirect(302, '/dashboard');
    }
    console.log(file)
    res.render('page/dashboard/decryptById', {dashboard: true, username: req.user.dataValues.username, email: req.user.dataValues.email, data: {id: file.id, size: file.fileSize, encryptionType: file.encryptionType, tanggal: `${file.createdAt.getDate()}/${file.createdAt.getMonth()+1}/${file.createdAt.getFullYear()}`, deskripsi: file.description, nama: `${file.filePath.split("/")[1].split(".")[0]}.${file.fileType.split("/")[1]}`}});
}

const getUpdateById = async (req, res) => {
    const file = await File.findByPk(req.params.id)
    if(file.type != "encrypt"){
        res.redirect(302, '/dashboard');
    }
    res.render('page/dashboard/updateById', {dashboard: true, username: req.user.dataValues.username, email: req.user.dataValues.email, data: {id: file.id, size: file.fileSize, tanggal: `${file.createdAt.getDate()}/${file.createdAt.getMonth()+1}/${file.createdAt.getFullYear()}`, deskripsi: file.description, nama: `${file.filePath.split("/")[1].split(".")[0]}.${file.fileType.split("/")[1]}`}});
}


export default { 
    getDashboard,
    getEncrypt,
    getDecrypt,
    getDecryptById,
    getUpdateById,
    getHistoryEncrypt,
    getHistoryDecrypt,
    getStegano
};