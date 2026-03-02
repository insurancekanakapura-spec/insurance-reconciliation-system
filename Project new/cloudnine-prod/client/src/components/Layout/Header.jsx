import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUIStore } from '../../store/useStore'
import {
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Key
} from 'lucide-react'

const Header = () => {
  const { user, apiKey, updateApiKey, clearApiKey } = useAuth()
  const { sidebarOpen, toggleSidebar, notifications } = useUIStore()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/cases') return 'Cases'
    if (path === '/cases/new') return 'New Case'
    if (path.startsWith('/cases/')) return 'Case Details'
    if (path === '/validation') return 'Validation Queue'
    if (path === '/dispatch') return 'Dispatch Management'
    if (path === '/settlement') return 'Settlement Tracking'
    if (path === '/queries') return 'Query Management'
    if (path === '/users') return 'User Management'
    if (path === '/reports') return 'Reports'
    if (path === '/settings') return 'Settings'
    return 'Cloudnine Insurance'
  }

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      updateApiKey(apiKeyInput.trim())
      setApiKeyInput('')
      setShowApiModal(false)
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-heading font-bold text-dark">{getPageTitle()}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search cases..."
            className="bg-transparent border-none outline-none text-sm w-48"
          />
        </div>

        {/* API Key Status */}
        <button
          onClick={() => setShowApiModal(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            apiKey ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          <Key size={16} />
          <span className="hidden sm:inline">{apiKey ? 'AI Enabled' : 'Setup AI'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell size={20} />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <button className="text-xs text-primary hover:underline">Mark all read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="font-semibold text-sm">{user?.name || user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <User size={16} />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings size={16} />
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false)
            setShowUserMenu(false)
          }}
        />
      )}

      {/* API Key Modal */}
      {showApiModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold">AI Configuration</h2>
              <button 
                onClick={() => setShowApiModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Enter your Anthropic API key to enable AI-powered document validation. 
              Get your key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.anthropic.com</a>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="input"
                />
              </div>

              {apiKey && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700">
                    ✅ AI is currently enabled with a saved API key
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSaveApiKey}
                  className="btn-primary flex-1"
                >
                  Save API Key
                </button>
                {apiKey && (
                  <button
                    onClick={() => {
                      clearApiKey()
                      setShowApiModal(false)
                    }}
                    className="btn-danger"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
