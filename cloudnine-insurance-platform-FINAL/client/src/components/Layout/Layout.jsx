import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useUIStore } from '../../store/useStore'

const Layout = () => {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>© 2024 Cloudnine Hospitals. All rights reserved.</p>
            <p>Insurance Workflow Platform v1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
