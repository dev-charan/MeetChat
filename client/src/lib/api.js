import { axiosInstance } from "./axios"

export const signUp = async(data)=>{
    const response = await axiosInstance.post("/auth/signup",data)
    return response.data
}

export const getAuthUser=async () => {
      const res = await axiosInstance.get('/auth/me');
      console.log(res.data);
      return res.data;
}

export const compleateOnloadring = async(userdata)=>{
    const res = await axiosInstance.post('/auth/onboarding',userdata)
    return res.data
}