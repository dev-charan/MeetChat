import React from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const Layout = ({showSidebar = false, children}) => {
  return (
    <div className='h-screen flex flex-col'>
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar/>}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar/>
          <main className='flex-1 overflow-hidden'>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
