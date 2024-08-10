import { File } from "../models";
import fs from 'fs';
import AES from "../lib/encryptionAES"
import Stegano from "../lib/encryptionStegano"
import crypto from 'crypto';

function generateRandomString(length) {
    const characters = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
}

const createFile = async (req, res) => {
    if(!req.body.password && !req.body.confirmPassword && !req.body.message && !req.files[0]){
        return res.redirect(302, '/dashboard/encrypt?success=false&message=Field is required');
    }
    if(!req.body.password){
        return res.redirect(302, '/dashboard/encrypt?success=false&message=Password is required');
    }
    if(!req.body.confirmPassword){
        return res.redirect(302, '/dashboard/encrypt?success=false&message=Password confirmation is required');
    }
    if(req.body.confirmPassword != req.body.password){
        return res.redirect(302, '/dashboard/encrypt?success=false&message=Password is not the same');
    }
    if(!req.body.message){
        return res.redirect(302, '/dashboard/encrypt?success=false&message=Message is required');
    }
    if(!req.files[0]){
        return res.redirect(302, '/dashboard/encrypt?success=false&message=File is required');
    }
    const fileUpload = req.files[0]
    const encryptionKey = crypto.randomBytes(32)
    const file = await File.create({
        type: "encrypt",
        description: "",
        createdAt: new Date(),
        filePath: `encrypted/${fileUpload.filename}.rda`,
        fileOriginal: fileUpload.originalname,
        fileType: fileUpload.mimetype,
        fileEncrypted: `${fileUpload.filename}.rda`,
        fileSize: fileUpload.size,
        encryptionKey: encryptionKey.toString('base64'),
        message: req.body.message,
        encryptionType: req.body.encryptionType,
        password: req.body.password,
        userId: req.user.dataValues.id
    })
    const SteganoEncrypt = await Stegano.encrypt(`${fileUpload.destination}${fileUpload.filename}`, `steganoStaging/${fileUpload.filename}.${fileUpload.mimetype.split("/")[1]}`, req.body.message, fileUpload.mimetype.split("/")[1])
    const encrypt = AES.encrypt(`steganoStaging/${fileUpload.filename}.${fileUpload.mimetype.split("/")[1]}`, `encrypted/${fileUpload.filename}.rda`, encryptionKey)

    res.redirect(302, '/dashboard?success=true&message=Enkripsi');
}

const decryptFile = async (req, res) => {
    const id = req.params.id
    if(!req.body.password){
        return res.redirect(302, '/dashboard/decrypt/'+id+'?success=false&message=Password is required');
    }
    const file = await File.findByPk(id)
    if(await File.comparePassword(req.body.password, file)){
        const decryptedFile = await File.create({
            type: "decrypt",
            description: file.description,
            createdAt: new Date(),
            filePath: `decrypted/${file.fileOriginal}`,
            fileOriginal: file.fileOriginal,
            fileEncrypted: file.fileEncrypted,
            fileType: file.fileType,
            fileSize: file.fileSize,
            encryptionType: file.encryptionType,
            password: req.body.password,
            userId: req.user.dataValues.id
        })
        const decrypt = AES.decrypt(file.filePath, `decrypted/${file.fileOriginal}`, Buffer.from(file.encryptionKey, 'base64'))
        res.redirect(302,  `/dashboard/stegano?success=true&message=Dekripsi&filename=${file.fileOriginal}`);
    }else{
        res.redirect(302, '/dashboard/encrypt?success=false&message=Failed to decrypt');
    }
        // const decryptedFile = await File.create({
        //     type: "decrypt",
        //     description: file.description,
        //     createdAt: new Date(),
        //     filePath: `decrypted/${file.filePath.split("/")[1]}`,
        //     fileType: file.fileType,
        //     fileSize: file.fileSize,
        //     encryptionType: file.encryptionType,
        //     encryptionKey: await Stegano.decrypt(file.filePath),
        //     password: "dummy",
        //     userId: req.user.dataValues.id
        // })
        // fs.copyFileSync(file.filePath, file.filePath.replace("encrypted", "decrypted"))
        // res.redirect(302, '/download/decrypt')

}

const steganoDecrypt = async (req, res) => {
    if(!req.files[0]){
        return res.redirect(302, '/dashboard/stegano?success=false&messageType=File is required');
    }
    const fileUpload = req.files[0]
    const message = await Stegano.decrypt(fileUpload.destination+fileUpload.filename,fileUpload.mimetype.split("/")[1])
    const file = await File.findAll({
        attributes: ["message"],
        where: {
            file_path: `encrypted/${req.body.filename}.rda`
        }
    });
    console.log(file)
    res.redirect(302, `/dashboard/stegano?message=${message == file[0].message ? message : file[0].message}&success=true&messageType=Stegano`);
}

const updateFile = async (req, res) => {
    const id = req.params.id
    if(!req.body.deskripsi){
        return res.redirect(302, '/dashboard/update/'+id+'?success=false&message=Description is required');
    }
    await File.update({description: req.body.deskripsi}, {
        where: {
            id: id
        }
    })
    res.redirect(302, '/dashboard/decrypt?success=true&message=Update');
}

const deleteFile = async (req, res) => {
    const id = req.params.id
    const file = await File.findByPk(id)
    fs.unlinkSync(file.filePath)
    await File.destroy({
        where: {
            id: id
        }
    })
    res.redirect(302, '/dashboard?success=true&message=Delete');
}

const downloadDecrypt = (req, res) => {
    res.download("decrypted/"+req.params.filename, () => {
        // fs.unlinkSync("decrypted/"+req.params.filename)
    })
}

const serveFile = (req, res) => {
    res.sendfile("decrypted/"+req.params.filename, () => {
        // fs.unlinkSync("decrypted/"+req.params.filename)
    })
}

export default { 
    createFile,
    decryptFile,
    downloadDecrypt,
    steganoDecrypt,
    deleteFile,
    updateFile,
    serveFile
};