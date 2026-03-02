import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Stethoscope, Building2, Users, Shield, Truck, DollarSign, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState('branch')
  const [username, setUsername] = useState('')
  const [password, setShowPassword] = useState('')
  const [showPassword, setShowPasswordState] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const roles = [
    { id: 'branch', label: 'Branch Staff', icon: Building2, desc: 'Create cases & upload documents' },
    { id: 'validation', label: 'Validation Team', icon: Shield, desc: 'Review & approve documents' },
    { id: 'dispatch', label: 'Dispatch Team', icon: Truck, desc: 'Handle dispatch & POD' },
    { id: 'settlement', label: 'Settlement Team', icon: DollarSign, desc: 'Track payments' },
    { id: 'admin', label: 'Administrator', icon: Users, desc: 'Full system access' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(username, password, selectedRole)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-dark flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Role Selection */}
        <div className="w-1/2 bg-gray-50 p-8 border-r border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-dark">Cloudnine</h1>
              <p className="text-sm text-gray-500">Insurance Workflow Platform</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Select Your Role</h2>
          
          <div className="space-y-3">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedRole === role.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className={`font-semibold ${selectedRole === role.id ? 'text-primary' : 'text-dark'}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-gray-500">{role.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              <strong>Demo Credentials:</strong><br />
              Branch: bng01 / branch123<br />
              Validation: validator1 / validate123<br />
              Admin: admin / admin123
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-heading font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-8">Sign in to access your dashboard</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={selectedRole === 'branch' ? 'bng01' : 'validator1'}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setShowPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordState(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Need help? Contact <a href="#" className="text-primary hover:underline">IT Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
