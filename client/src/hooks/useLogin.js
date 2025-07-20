import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { login } from '../lib/api'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'

const useLogin = () => {
      const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {mutate,isPending,error}=useMutation({
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
  return {error,isPending,loginMutation:mutate}
}

export default useLogin