import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUIStore } from '../../store/useStore'
import {
  LayoutDashboard,
  FolderOpen,
  FileCheck,
  Truck,
  DollarSign,
  HelpCircle,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  Stethoscope
} from 'lucide-react'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['branch', 'validation', 'dispatch', 'settlement', 'admin'] },
    { path: '/cases', label: 'Cases', icon: FolderOpen, roles: ['branch', 'validation', 'dispatch', 'settlement', 'admin'] },
    { path: '/validation', label: 'Validation', icon: FileCheck, roles: ['validation', 'admin'] },
    { path: '/dispatch', label: 'Dispatch', icon: Truck, roles: ['dispatch', 'admin'] },
    { path: '/settlement', label: 'Settlement', icon: DollarSign, roles: ['settlement', 'admin'] },
    { path: '/queries', label: 'Queries', icon: HelpCircle, roles: ['branch', 'validation', 'dispatch', 'settlement', 'admin'] },
    { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['validation', 'dispatch', 'settlement', 'admin'] },
    { path: '/users', label: 'Users', icon: Users, roles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['branch', 'validation', 'dispatch', 'settlement', 'admin'] },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  )

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'validation':
        return { text: 'Validation Team', className: 'role-badge role-validation' }
      case 'dispatch':
        return { text: 'Dispatch Team', className: 'role-badge role-dispatch' }
      case 'settlement':
        return { text: 'Settlement Team', className: 'role-badge role-settlement' }
      case 'admin':
        return { text: 'Administrator', className: 'role-badge role-admin' }
      default:
        return { text: 'Branch Staff', className: 'role-badge bg-gray-100 text-gray-700' }
    }
  }

  const roleBadge = getRoleBadge()

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Stethoscope className="text-white" size={20} />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-heading font-bold text-dark text-sm whitespace-nowrap">Cloudnine</h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">Insurance Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : 'text-gray-600'}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name || user?.username}</p>
                <span className={roleBadge.className}>{roleBadge.text}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            className="w-10 h-10 flex items-center justify-center text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors mx-auto"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
