import express from "express"
import uploadFile from "../middleware/uploadFile.js"
import { uploadController } from "../controllers/uploadController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router()

router.post('/upload_avatar',auth,uploadFile,uploadController.uploadAvatar)

export default router