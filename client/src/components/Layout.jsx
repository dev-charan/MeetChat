import React, { Children } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const Layout = ({showSidebar=false,children}) => {
  return (
    <div className='min-h-screen'>
        <div className="flex">
            {showSidebar && <Sidebar/>}
        <div className="flex-1 flex flex-col">
            <Navbar/>
            <main className='flex1 overflow-y-auto'>
                {children}
            </main>
        </div>
        </div>
    </div>
  )
}

export default Layout