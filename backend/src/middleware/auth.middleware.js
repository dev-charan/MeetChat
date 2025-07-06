import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectedRoute = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({
                message:"Unauthorized - No token provided"
            })
        }
        const decode = jwt.verify(token,process.env.JWT)

        if(!decode){
             return res.status(401).json({
                message:"Unauthorized - Invalid token provided"
            })
        }

        const user = await User.findById(decode.userId).select("-password");
        if(!user){
             return res.status(401).json({
                message:"user not found"
            })
        }
        req.user = user;
        next();

    } catch (error) {
        console.log(error);
         return res.status(401).json({
                message:"something went wrong in protected route"
            })
    }
}