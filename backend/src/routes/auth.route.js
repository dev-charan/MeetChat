import express, { Router } from "express"
import { login,logout,signup } from "../controller/auth.controller.js"
const authRoute = express.Router()

authRoute.post("/login",login)
authRoute.post("/logout",logout)
authRoute.post("/signup",signup)

export default authRoute;