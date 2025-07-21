import express from "express"
import { protectedRoute } from "../middleware/auth.middleware.js"
import { getRecommendedUsers,getMyFriends,sendFriendRequest,acceptFriendRequest,getFriendRequests,getOutgoingFriendReqs} from "../controller/user.controller.js"

const userRoute = express.Router()


userRoute.use(protectedRoute)
userRoute.get("/",getRecommendedUsers)
userRoute.get("/friends",getMyFriends)
userRoute.post("/friend-request/:idx",sendFriendRequest)
userRoute.put("/friend-request/:idx/accept",acceptFriendRequest)
userRoute.get("/friend-request",getFriendRequests)
userRoute.get("/outgoing-friend-request",getOutgoingFriendReqs)
export default userRoute
