import express, { Router } from "express"
import { login,logout,signup,onboard} from "../controller/auth.controller.js"
import { protectedRoute } from "../middleware/auth.middleware.js"

const authRoute = express.Router()

authRoute.post("/login",login)
authRoute.post("/logout",logout)
authRoute.post("/signup",signup)

authRoute.post("/onboarding",protectedRoute,onboard)

authRoute.get("/me",protectedRoute,(req,res)=>{
    return res.status(200).json({
        success:true,
        user:req.user
    })    
})

export default authRoute;