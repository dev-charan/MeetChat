import { axiosInstance } from "./axios"

export const signUp = async(data) => {
    const response = await axiosInstance.post("/auth/signup", data)
    return response.data
}

export const login = async(logindata) => {
    const response = await axiosInstance.post("/auth/login", logindata)
    return response.data
}

export const logout = async() => {
    const response = await axiosInstance.post("/auth/logout")
    return response.data
}

export const getAuthUser = async() => {
    try {
        const res = await axiosInstance.get('/auth/me');
        console.log(res.data);
        return res.data;
    } catch (error) {
        return null
    }
}

export const compleateOnloadring = async(userdata) => {
    const res = await axiosInstance.post('/auth/onboarding', userdata)
    return res.data
}

export async function getUserFriends() {
    const response = await axiosInstance.get("/users/friends");
    return response.data;
}

export async function getRecommendedUsers() {
    const response = await axiosInstance.get("/users");
    return response.data;
}

export async function getOutgoingFriendReqs() {
    const response = await axiosInstance.get("/users/outgoing-friend-request");
    return response.data;
}

export async function sendFriendRequest(userId) {
    const response = await axiosInstance.post(`/users/friend-request/${userId}`);
    return response.data;
}

export async function getFriendRequests() {
    try {
        const response = await axiosInstance.get("/users/friend-request");
        console.log("Friend requests response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        throw error;
    }
}

export async function acceptFriendRequest(requestId) {
    try {
        const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
        return response.data;
    } catch (error) {
        console.error("Error accepting friend request:", error);
        throw error;
    }
}

export async function getStreamToken() {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
}
