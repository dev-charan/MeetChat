import friendRequest from "../models/FriendRequest.js";
import User from "../models/User.js"

export async function getRecommendedUsers(req, res, next) {
    try {
        const currentUserId = req.user._id;
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
        const user = await User.findById(req.user._id)
            .select("friends")
            .populate("friends", "fullname profilePic nativelang");

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

export async function sendFriendRequest(req, res, next) {
    try {
        const myId = req.user._id;
        const { id: recipientId } = req.params;

        if (myId.toString() === recipientId.toString()) {
            return res.status(400).json({
                message: "You cannot send a friend request to yourself",
            });
        }

        const recipient = await User.findById(recipientId);

        if (!recipient) {
            return res.status(404).json({
                message: "Recipient not found",
            });
        }

        if (recipient.friends.includes(myId)) {
            return res.status(400).json({
                message: "You are already friends with this user",
            });
        }

        const existingRequest = await friendRequest.findOne({
            $or: [
                { sender: myId.toString(), recipient: recipientId.toString() }, // ✅ Convert to strings
                { sender: recipientId.toString(), recipient: myId.toString() },
            ],
        });

        if (existingRequest) {
            return res.status(400).json({
                message: "A friend request already exists between you and this user",
            });
        }

        const createdRequest = await friendRequest.create({
            sender: myId.toString(), // ✅ Store as string to match your DB format
            recipient: recipientId.toString(),
        });

        return res.status(201).json(createdRequest);
    } catch (error) {
        console.error("Error in sendFriendRequest:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function acceptFriendRequest(req, res, next) {
    try {
        const { id: requestId } = req.params;
        
        const friendreq = await friendRequest.findById(requestId);
        
        if (!friendreq) {
            return res.status(404).json({
                message: "Friend request not found"
            });
        }
        
        // ✅ Convert both to strings for comparison
        if (friendreq.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized"
            });
        }
        
        friendreq.status = "accepted";
        await friendreq.save();
        
        await User.findByIdAndUpdate(friendreq.sender, {
            $addToSet: {
                friends: friendreq.recipient
            }
        });
        
        await User.findByIdAndUpdate(friendreq.recipient, {
            $addToSet: {
                friends: friendreq.sender
            }
        });
        
        return res.status(200).json({
            message: "Friend request accepted"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getFriendRequests(req, res, next) {
    try {
        console.log("🔍 === getFriendRequests Debug Start ===");
        
        // ✅ Convert to string to match your DB format
        const userId = req.user._id.toString();
        console.log("🔍 Current user ID:", userId);
        console.log("🔍 User ID type:", typeof userId);
        
        // Debug: Check if any friend requests exist at all
        const allRequests = await friendRequest.find({});
        console.log("🔍 Total friend requests in DB:", allRequests.length);
        
        // Debug: Check if any pending requests exist
        const allPendingRequests = await friendRequest.find({ status: "pending" });
        console.log("🔍 Total pending requests in DB:", allPendingRequests.length);
        
        // Debug: Check requests for this specific user (without populate first)
        const userRequestsRaw = await friendRequest.find({
            recipient: userId,
            status: "pending",
        });
        console.log("🔍 Raw pending requests for user (no populate):");
        console.log("🔍 Count:", userRequestsRaw.length);
        console.log("🔍 Data:", JSON.stringify(userRequestsRaw, null, 2));
        
        // Now with populate
        const incommingreq = await friendRequest.find({
            recipient: userId, // ✅ Use string version
            status: "pending",
        }).populate("sender", "fullname profilePic nativelang");

        console.log("🔍 Pending requests after populate:");
        console.log("🔍 Count:", incommingreq.length);
        console.log("🔍 Data:", JSON.stringify(incommingreq, null, 2));

        // Debug the populate fields
        if (incommingreq.length > 0) {
            console.log("🔍 First request sender data:");
            console.log("🔍 Sender ID:", incommingreq[0].sender?._id);
            console.log("🔍 Sender fullname:", incommingreq[0].sender?.fullname);
            console.log("🔍 Sender profilePic:", incommingreq[0].sender?.profilePic);
            console.log("🔍 Sender nativelang:", incommingreq[0].sender?.nativelang);
        }

        const acceptedReq = await friendRequest.find({
            sender: userId, // ✅ Use string version
            status: "accepted",
        }).populate("recipient", "fullname profilePic nativelang");

        console.log("🔍 Accepted requests count:", acceptedReq.length);
        console.log("🔍 === getFriendRequests Debug End ===");

        return res.status(200).json({
            message: "Friend requests retrieved successfully",
            pendingRequests: incommingreq,
            acceptedRequests: acceptedReq
        });
    } catch (error) {
        console.error("❌ Error in getFriendRequests:", error);
        console.error("❌ Error stack:", error.stack);
        return res.status(500).json({
            message: "Error retrieving friend requests",
            error: error.message
        });
    }
}


export async function getOutgoingFriendReqs(req, res) {
    try {
        const outgoingRequests = await friendRequest.find({
            sender: req.user._id.toString(), // ✅ Convert to string
            status: "pending",
        }).populate("recipient", "fullname profilePic nativelang");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
