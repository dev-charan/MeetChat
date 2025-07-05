import express, { Router } from "express"
import { login,logout,signup,onboard} from "../controller/auth.controller.js"
import { protectedRoute } from "../middleware/auth.middleware.js"

const authRoute = express.Router()

authRoute.post("/login",login)
authRoute.post("/logout",logout)
authRoute.post("/signup",signup)

authRoute.post("/onboarding",protectedRoute,onboard)
export default authRoute;