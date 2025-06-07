import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import bcrypt from 'bcryptjs'
export const register = async (req, res) => {
    try {
        const { fullname, username, password, gender } = req.body;
        if (!fullname || !username || !password || !gender) {
            return res.status(400).json({ message: "all fields must be filled correctly" })
        }
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "Username already exits please try different or login" })
        }

        const hashedpass = await bcrypt.hash(password, 10);
        const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        await User.create({
            fullname,
            username,
            password: hashedpass,
            profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
            gender
        })
        // return res.status(200).json({
        //     message: "account created succesfully",
        //     sucess: true
        // })
         const tokenData = {
                    userId: user._id
                }
                const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
                return res.status(200).cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "strict" }).json({
                    message: "succesfully loged in",
                    sucess: true,
                    userId: user._id,
                    username: user.username,
                    gender: user.gender,
                    profilePhoto: user.profilePhoto,
                })

    }
    catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "all fields require to be filled correctly" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "user does not exits try registering" })
        }
        else {
            const didPassMatch = await bcrypt.compare(password, user.password);
            if (!didPassMatch) {
                return res.status(400).json(
                    {
                        message: "wrong password",
                        sucess: false
                    }
                )
            }
            else {
                const tokenData = {
                    userId: user._id
                }
                const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
                return res.status(200).cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "strict" }).json({
                    message: "succesfully loged in",
                    sucess: true,
                    userId: user._id,
                    username: user.username,
                    gender: user.gender,
                    profilePhoto: user.profilePhoto,
                })
            }

        }
    }
    catch (error) {
        console.log(error);
    }
}
export const logout = async (req,res)=>{
    try {
        return res.status(200).cookie("token","",{maxAge:0}).json(
            {
                message:"logged out successfully"
            }
        )
    } catch (error) {
        console.log(error)
    }
}
export const getOtherUsers = async(req,res)=>{
    try {
        const loggedInUserId=req.id;
        const otherUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password")
        return res.status(200).json(otherUsers)
    } catch (error) {
        console.log(error)
    }
}
export const getProfile = async(req,res)=>{
    try {
        const userid=req.id;
        
        return res.status(200).json({
            id:userid,
            

        });
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to get user profile"
        });
    }
}