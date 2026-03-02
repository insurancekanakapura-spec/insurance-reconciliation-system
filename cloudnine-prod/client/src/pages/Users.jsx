import React from 'react'
import { useQuery } from 'react-query'
import { usersAPI } from '../utils/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { Users, UserPlus, Edit2, ToggleRight, Trash2, Shield, Building2, Truck, DollarSign, CheckCircle } from 'lucide-react'

const Users = () => {
  const { data, isLoading } = useQuery(
    'users',
    () => usersAPI.getAll().then(r => r.data)
  )

  if (isLoading) return <LoadingSpinner fullScreen />

  const users = data?.data || []

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={16} />
      case 'validation': return <CheckCircle size={16} />
      case 'dispatch': return <Truck size={16} />
      case 'settlement': return <DollarSign size={16} />
      default: return <Building2 size={16} />
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      validation: 'bg-blue-100 text-blue-700',
      dispatch: 'bg-yellow-100 text-yellow-700',
      settlement: 'bg-green-100 text-green-700',
      branch: 'bg-gray-100 text-gray-700',
    }
    return styles[role] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">User Management</h2>
        <button className="btn-primary">
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {(user.name || user.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>{user.branch?.name || '-'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Toggle Status">
                        <ToggleRight size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users
