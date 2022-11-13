import fs from "fs" 
import { removeTmp } from "../units/removeTmp.js"

export default async (req, res, next) => {
    try {
        if(!req.files || Object.keys(req.files).length === 0)
            return res.status(400).json({msg: "No files wrere uploaded."})
        const file = req.files.file
        
        if(file.size > 1024 * 1024){
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "Size too large"})
        } // 1mb

        if(file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg'){
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "File format is incorrect."})
        } // 1mb

        next()

    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

