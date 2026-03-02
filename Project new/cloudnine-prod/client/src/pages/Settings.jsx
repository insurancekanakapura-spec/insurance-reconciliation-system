import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Settings, User, Lock, Bell, Shield, Key, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const { user, apiKey, updateApiKey, clearApiKey } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [apiKeyInput, setApiKeyInput] = useState('')

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      updateApiKey(apiKeyInput.trim())
      setApiKeyInput('')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Configuration', icon: Key },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-heading font-bold">Settings</h2>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="card p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Profile Settings
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value={user?.username} className="input-readonly" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" defaultValue={user?.name} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" defaultValue={user?.email} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" defaultValue={user?.phone} className="input" />
                </div>
                <button className="btn-primary">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                <Lock size={20} className="text-primary" />
                Security Settings
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" className="input" placeholder="Enter current password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" className="input" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" className="input" placeholder="Confirm new password" />
                </div>
                <button className="btn-primary">
                  <Save size={18} />
                  Change Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email updates for case status changes</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded" />
                  <div>
                    <p className="font-medium">Browser Notifications</p>
                    <p className="text-sm text-gray-500">Show desktop notifications</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-primary rounded" />
                  <div>
                    <p className="font-medium">Daily Summary</p>
                    <p className="text-sm text-gray-500">Receive daily summary email</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="card p-6">
              <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                <Key size={20} className="text-primary" />
                AI Configuration
              </h3>
              <div className="space-y-4 max-w-md">
                <p className="text-gray-600">
                  Enter your Anthropic API key to enable AI-powered document validation.
                  Get your key from{' '}
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    console.anthropic.com
                  </a>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={apiKey ? '••••••••••••••••' : 'sk-ant-...'}
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
                  <button onClick={handleSaveApiKey} className="btn-primary flex-1">
                    <Save size={18} />
                    Save API Key
                  </button>
                  {apiKey && (
                    <button onClick={clearApiKey} className="btn-danger">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
