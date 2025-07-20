import { useMutation, useQueryClient } from '@tanstack/react-query'
import React,{useState} from 'react'
import { login } from '../lib/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'

const Login = () => {
  const [logindata, setLogindata] = useState({
    email:"charan@gmail.com",
    password:"1234567"
  })
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const {mutate:loginMutation,isPending,error}=useMutation({
    mutationFn:login,
    onSuccess:()=>{
      toast.success("Login success")
      queryClient.invalidateQueries({queryKey:['authUser']})
      navigate('/')


    },
    onError:()=>{
      toast.error("something went wrong")
    }
  })
  const handleLogin=(e)=>{
      e.preventDefault();
      loginMutation(logindata)
  }
  return (
    <div className='h-screen'>
      <button onClick={handleLogin}>login</button>
    </div>
  )
}

export default Login