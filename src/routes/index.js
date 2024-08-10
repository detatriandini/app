import {Router} from 'express';
import UserController from '../controllers/UserController';
import DashboardController from '../controllers/DashboardController';
import FileController from '../controllers/FileController';
import { 
     isAuthenticated, 
     isNotAuthenticated, 
     authenticateLogin, 
     authenticateRegister 
} from '../config/auth';
import multer from 'multer';

const router = Router();

const upload = multer({ dest: "uploads/" });

// Rotas Get
router.get('/', UserController.getIndex);
// router.get('/about', UserController.getAbout);
// router.get('/contact', UserController.getContact);

router.get('/login', isNotAuthenticated, UserController.getLogin);
router.get('/daftar', isNotAuthenticated, UserController.getRegister);
router.get('/lupa-password', isNotAuthenticated, UserController.getReset);
router.get('/logout', UserController.getLogout);

// Rota autenticada
router.get('/auth', isAuthenticated, UserController.getAuth);
router.get('/dashboard', isAuthenticated, DashboardController.getDashboard);
router.get('/dashboard/encrypt', isAuthenticated, DashboardController.getEncrypt);
router.get('/dashboard/decrypt', isAuthenticated, DashboardController.getDecrypt);
router.get('/dashboard/stegano', isAuthenticated, DashboardController.getStegano);
router.get('/dashboard/decrypt/:id', isAuthenticated, DashboardController.getDecryptById);
router.get('/dashboard/update/:id', isAuthenticated, DashboardController.getUpdateById);
router.get('/dashboard/history-encrypt', isAuthenticated, DashboardController.getHistoryEncrypt);
router.get('/dashboard/history-decrypt', isAuthenticated, DashboardController.getHistoryDecrypt);
router.get('/download/decrypt/:filename', isAuthenticated, FileController.downloadDecrypt);
router.get('/file/decrypt/:filename', isAuthenticated, FileController.serveFile);





// Rotas Post
router.post('/register', authenticateRegister);
router.post('/login', authenticateLogin);
router.post('/file', isAuthenticated,upload.array("file"), FileController.createFile);
router.post('/fileStegano', isAuthenticated,upload.array("file"), FileController.steganoDecrypt);
router.post('/decrypt/:id', isAuthenticated, FileController.decryptFile);
router.post('/update/:id', isAuthenticated, FileController.updateFile);
router.get('/delete/:id', isAuthenticated, FileController.deleteFile);
router.get('/error', (req,res) => {
     throw new Error('Erro Interno');
})

export default router;