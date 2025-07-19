import React from 'react'
import { getAuthUser } from '../lib/api';
import { useQuery } from '@tanstack/react-query';

const useAuthUser = () => {

  const authQuery = useQuery({

    queryKey: ['authUser'],
    queryFn:getAuthUser,
    retry: false,
    refetchOnWindowFocus: false,

  });

    return { isLoading:authQuery.isLoading, authUser:authQuery.data?.user}
}

export default useAuthUser