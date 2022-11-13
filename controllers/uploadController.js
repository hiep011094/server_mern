import { cloudinary } from "../units/cloudinary.js";
import { removeTmp } from "../units/removeTmp.js"


export const uploadController = {
    uploadAvatar: async (req, res) => {

        try {
            const file = req.files.file
            const file_old = req.body.file_old
            if (file_old)
                await cloudinary.v2.uploader.destroy(file_old)

            await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: 'avatar', width: 150, height: 150, crop: "fill"
            }, async (err, result) => {
                if (err) throw err
                removeTmp(file.tempFilePath)
                res.status(200).json({ url: result.secure_url })
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    }
}