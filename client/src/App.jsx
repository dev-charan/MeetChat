import React from 'react'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import Call from './pages/Call'
import Login from './pages/Login'
import Notification from './pages/Notification'
import SignUp from './pages/SignUp'
import Onborad from './pages/Onborad'
import Chat from './pages/Chat'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from './lib/axios'

const App = () => {
const {data, isLoading,error} = useQuery({queryKey:'todo',
  queryFn:async()=>{
    const res= axiosInstance.get("/auth/me")
    
    return res.data
  }
})
console.log(data);

  return (
    <div className='h-screen' data-theme="night">
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/notification' element={<Notification/>}/>
        <Route path='/onboarding' element={<Onborad/>}/>
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/call' element={<Call/>}/>
    </Routes>
    <Toaster/>
 </div>
  )
}

export default App
