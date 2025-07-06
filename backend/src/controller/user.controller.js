import User from "../models/User.js"

export async function getRecommendedUsers(req, res, next) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { _id: { $nin: currentUser.friends } },
                { isOnboarded: true }
            ]
        });

        return res.status(200).json(recommendedUsers); 
    } catch (error) {
        console.error("Error in getRecommendedUsers:", error);
        return res.status(500).json({ success: false, message: "Internal server error" }); 
    }
}

export async function getMyFriends(req, res, next) {
    try {
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate("friends", "fullname profilePic nativelang learningLanguage");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, friends: user.friends });

    } catch (error) {
        console.error("Error in getMyFriends:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching friends"
        });
    }
}
