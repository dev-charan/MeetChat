import friendRequest from "../models/FriendRequest.js";
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

export async function sendFriendRequest(req, res, next) {
  try {
    const myId = req.user.id;
    const { idx: recipientId } = req.params;

    if (myId === recipientId) {
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
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }

    const createdRequest = await friendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    return res.status(201).json(createdRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function acceptFriendRequest(req,res,next) {
    
    try {
        const {idx:requestId} = req.params

        const friendreq = await friendRequest.findById(requestId);

        if(!friendreq){
            return res.status(404).json({
                message:"Friend request not found"
            })
        }

        if(friendreq.recipient.toString() !== req.user.id){
            return res.status(403).json({
                message:"you are not authized"
            })
        }
        friendreq.status="accepted"
        await friendreq.save()


        await User.findByIdAndUpdate(friendreq.sender,{
          $addToSet:{
            friends:friendreq.recipient
          }
        })
          await User.findByIdAndUpdate(friendreq.recipient,{
          $addToSet:{
            friends:friendreq.sender
          }
        })

        return res.status(200).json({
          message:"Friend req accepted"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getFriendRequests(req, res, next) {
  try {
    const incommingreq = await friendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReq = await friendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    return res.status(200).json({
      message: "no errors in the getfriendreq",
      pendingRequests: incommingreq,
      acceptedRequests: acceptedReq
    });
  } catch (error) {
    return res.status(500).json({
      message: "errors in the getfriendreq",
      error: error.message
    });
  }
}

export async function getOutgoingFriendReq(req,res,next) {
   
  try {
    const outgoingRequest = await friendRequest.find({
      sender:req.user.id,
      status:"pending",
    }).populate("recipient","fullName profilePic nativeLanguage learningLanguage")

    return res.status(200).json(outgoingRequest)
  } catch (error) {
     return res.status(500).json({
      message: "errors in the getougoingreq",
      error: error.message
    });
  }
}