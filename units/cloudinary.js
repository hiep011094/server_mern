import cloudinary from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

const removeTmp = (path) =>{
    fs.unlink(path, err =>{
        if(err) throw err
    })
}


export {cloudinary , removeTmp }
