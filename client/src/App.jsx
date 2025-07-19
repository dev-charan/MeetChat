import React from 'react'
import { Route, Routes, Navigate } from 'react-router'
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

const ProtectedRoute = ({ children, isAuth }) => {
  return isAuth ? children : <Navigate to="/login" replace />
}

const App = () => {
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await axiosInstance.get('/auth/me')
      return res.data
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  const currentUser = authData?.user

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        {/* Public Routes */}
       
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
         <Route path="/"  element={
            <ProtectedRoute isAuth={!!currentUser}>
              <Home/>
            </ProtectedRoute>
          }/>
          
        <Route
          path="/notification"
          element={
            <ProtectedRoute isAuth={!!currentUser}>
              <Notification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute isAuth={!!currentUser}>
              <Onborad />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute isAuth={!!currentUser}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/call"
          element={
            <ProtectedRoute isAuth={!!currentUser}>
              <Call />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
