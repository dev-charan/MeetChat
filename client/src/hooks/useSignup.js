import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { signUp } from '../lib/api'
import { useNavigate } from 'react-router'

const useSignup = () => {
     const navigate = useNavigate()
     const queryClient = useQueryClient()

    const {mutate,isPending,error} = useMutation({
    mutationFn:signUp,
    onSuccess:()=> {queryClient.invalidateQueries({queryKey:["authUser"]})
    navigate("/")}
  })
  return{error,isPending,signUpMutaion:mutate}
}

export default useSignup