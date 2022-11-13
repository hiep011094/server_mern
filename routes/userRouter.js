import express from "express"
import  userController  from "../controllers/userController.js";
import { auth } from "../middleware/auth.js"
import { authAdmin } from "../middleware/authAdmin.js";
const router = express.Router()

router.post('/register', userController.register)
router.post('/activate', userController.activateEmail)
router.post('/login', userController.login)
router.post('/refresh_token', userController.getAccessToken)
router.post('/forgot', userController.forgotPassword)
router.post('/reset', auth , userController.resetPassword)
router.get('/infor', auth , userController.getUserInfor)
router.get('/all_infor', auth, authAdmin , userController.getUserAllInfor)
router.get('/logout', userController.logout)
router.patch('/update',auth, userController.updateUser)
router.patch('/update_password',auth, userController.updatePassword)
router.patch('/update_role/:id',auth, authAdmin, userController.updateUserRole)
router.delete('/delete/:id',auth, authAdmin, userController.deleteUser)

export default router