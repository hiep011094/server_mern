import fs from "fs";
export const removeTmp = (path) =>{
    fs.unlink(path, err =>{
        if(err) throw err
    })
}