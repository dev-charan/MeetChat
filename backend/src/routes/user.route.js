import express from "express"
import { protectedRoute } from "../middleware/auth.middleware.js"
import { getRecommendedUsers,getMyFriends } from "../controller/user.controller.js"

const userRoute = express.Router()


userRoute.use(protectedRoute)
userRoute.get("/",getRecommendedUsers)
userRoute.get("/friends",getMyFriends)

export default userRoute
