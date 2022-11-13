import Users from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "./sendMail.js";

const userController = {
    register: async (req, res) => {
        try {
            const { name, email, password,address,phone } = req.body

            if (!name || !email || !password)
                return res.status(400).json({ msg: "Please fill in all fields." })

            if (!validateEmail(email))
                return res.status(400).json({ msg: "Invalid email." })

            const user = await Users.findOne({ email })
            if (user) return res.status(400).json({ msg: "This email already exists." })

            if (password.length < 6)
                return res.status(400).json({ msg: "Password must be at least 6 characters." })

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                name, email, password: passwordHash, address , phone
            }

            // const { password, ...rest } = newUser
            const activation_token = createActivationToken(newUser)


            const url = `${process.env.CLIENT_URL}/auth/activate/${activation_token}`
            sendMail(email, url, "Verify your email address")


            res.json({ msg: "Register successfully! Please activate your email to start." })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    activateEmail: async (req, res) => {
        try {
            const { activation_token } = req.body
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)

            const { email } = user
            const check = await Users.findOne({ email })
            if (check) return res.status(400).json({ msg: "This email already exists." })

            const newUser = new Users(user)

            await newUser.save()

            res.status(200).json({ msg: "Account has been activated!" })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body
            const user = await Users.findOne({ email })
            if (!user) return res.status(400).json({ msg: "This email does not exist." })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })

            const refresh_token = createRefreshToken({ id: user._id })
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                path: 'user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 day
            })

            res.status(200).json({ msg: "Login successfully!" })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refresh_token
            if (!rf_token) return res.status(400).json({ msg: "Please login now!" })

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(400).json({ msg: "Please login now!" })

                const access_token = createAccessToken({ id: user.id })

                res.status(200).json({ access_token })
            })


        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body
            const user = await Users.findOne({ email })
            if (!user) return res.status(400).json({ msg: "This email does not exist." })

            const access_token = createAccessToken({ id: user._id })

            const url = `${process.env.CLIENT_URL}/auth/reset/${access_token}`

            sendMail(email, url, 'Reset your password')

            res.status(200).json({ msg: "Re-send the password, please check your email." })

        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    resetPassword: async (req, res) => {
        try {
            const {password} = req.body
            const passwordHash = await bcrypt.hash(password,12)
            
            await Users.findOneAndUpdate({_id: req.user.id},{
                password: passwordHash
            })

            res.status(200).json({msg: "Reset Password successfully!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserInfor: async (req, res) =>{
        try {
            const user = await Users.findById(req.user.id).select('-password')
            res.status(200).json(user)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserAllInfor: async (req, res) =>{
        try {
            const users = await Users.find().select('-password')
            res.status(200).json(users)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    logout: async (req, res) =>{
        try {
            res.clearCookie('refresh_token',{path: '/api/v1/user'})
            return res.status(200).json({msg: "Logged Out Successfully."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUser: async (req, res) =>{
        try {
           const {name,address,phone,avatar} = req.body
        //    console.log(req.body);
           await Users.findOneAndUpdate({_id: req.user.id},{
            name,address,phone,avatar
           })
           res.json({msg: "Update successfully!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updatePassword: async (req, res) =>{
        try {

            const { curent_password, password } = req.body
            const user  = await Users.findById(req.user.id)

            const isMatch = await bcrypt.compare(curent_password, user.password)
            if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })

            const passwordHash = await bcrypt.hash(password, 12)


            await Users.findOneAndUpdate({_id: req.user.id},{
                password: passwordHash
            })

            res.json({msg: "Update password successfully!"})
            
        } catch (error) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUserRole: async (req, res) =>{
        try {
           const {role} = req.body
           await Users.findOneAndUpdate({_id: req.params.id},{
            role
           })
           res.status(200).json({msg: "Update successfully!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteUser: async (req, res) =>{
        try {
           await Users.findOneAndDelete({_id: req.params.id})
           res.status(200).json({msg: "Delete successfully!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}



const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: '5m' })
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7m' })
}

export default userController