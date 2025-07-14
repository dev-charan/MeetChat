import React from 'react'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import Call from './pages/Call'
import Login from './pages/Login'
import Notification from './pages/Notification'
import SignUp from './pages/SignUp'
import Onborad from './pages/Onborad'
import Chat from './pages/Chat'
const App = () => {

  return (
    <div className='h-screen' data-theme="night">
    <Routes>
        <Route path='/' element={Home}/>
    </Routes>
 </div>
  )
}

export default App
