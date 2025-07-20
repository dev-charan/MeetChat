import { axiosInstance } from "./axios"

export const signUp = async(data)=>{
    const response = await axiosInstance.post("/auth/signup",data)
    return response.data
}
export const login = async(logindata)=>{
    const response = await axiosInstance.post("/auth/login",logindata)
    return response.data
}
export const logout = async()=>{
    const response = await axiosInstance.post("/auth/logout")
    return response.data
}

export const getAuthUser=async () => {
     try {
         const res = await axiosInstance.get('/auth/me');
         console.log(res.data);
         return res.data;
     } catch (error) {
        return null
     }
}

export const compleateOnloadring = async(userdata)=>{
    const res = await axiosInstance.post('/auth/onboarding',userdata)
    return res.data
}