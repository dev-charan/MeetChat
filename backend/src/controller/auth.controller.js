import User from "../models/User.js";
import jwt from "jsonwebtoken"

export async function signup(req,res){
    const {email ,password,fullname} = req.body

    try {
        if(!email || !password || !fullname){
            return res.status(400).json({
                message:"All fields required"
            })
        }
        if(password.length < 6){
            return res.status(400).json({
                message:"Password length must be 6 char"
            })
        }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
    }

    
    const existingEmail = await User.findOne({email})
    if(existingEmail){
        return res.status(400).json({
            message:"Email already exists"
        })
    }

    const index = Math.floor(Math.random()*100)+1 ;
    const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`

    const newUser = await User.create({
        email,fullname,password,profilePic:randomAvatar
    })

    const token = jwt.sign({userId:newUser._id},process.env.JWT,{
        expiresIn:"7d"
    })

    res.cookie("jwt",token,{
        maxAge:7 * 24 * 60 *60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV === "production"
    })

    res.status(201).json({
        success:true,
        message:"User created",
        user:newUser
    })
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success:false,
            message:'User not created some error'

        })
    }

}


export async function login(req,res){
try {
    const {email,password}=req.body;
    if(!email,!password){
        res.status(400).json({
            message:"all field is required"
        })
    }
    const user = await User.findOne({email})
    if(!user){
        return res.status(401).json({
            message:"Invalid email or password"
        })
    }
     const isPassword = await user.matchPassword(password)
     if(!isPassword){
        res.status(401).json({
            message:"Invalid email or password"
        })
     }

      const token = jwt.sign({userId:user._id},process.env.JWT,{
        expiresIn:"7d"
    })

    res.cookie("jwt",token,{
        maxAge:7 * 24 * 60 *60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV === "production"
    })

    res.status(201).json({
        success:true,
        message:"login done",
        user:user
    })
} catch (error) {
     console.log(error);
        
        res.status(500).json({
            success:false,
            message:'User not created some error'

        })
}
}
export async function logout(req,res){
   res.clearCookie("jwt")
    res.status(200).json({
        message:"logout done"
    })
}