import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { dashboardAPI } from '../utils/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  FolderOpen,
  FileCheck,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Building2,
  Activity
} from 'lucide-react'
import { format, subDays } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('7d')

  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    () => dashboardAPI.getStats().then(r => r.data),
    { refetchInterval: 30000 }
  )

  const { data: branchSummary, isLoading: branchLoading } = useQuery(
    'branchSummary',
    () => dashboardAPI.getBranchSummary().then(r => r.data)
  )

  const { data: insuranceSummary, isLoading: insuranceLoading } = useQuery(
    'insuranceSummary',
    () => dashboardAPI.getInsuranceSummary().then(r => r.data)
  )

  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    'recentActivity',
    () => dashboardAPI.getRecentActivity().then(r => r.data)
  )

  const { data: agingReport, isLoading: agingLoading } = useQuery(
    'agingReport',
    () => dashboardAPI.getAgingReport().then(r => r.data)
  )

  const isLoading = statsLoading || branchLoading || insuranceLoading || activityLoading || agingLoading

  if (isLoading) return <LoadingSpinner fullScreen />

  const metrics = [
    { 
      label: 'Total Cases', 
      value: stats?.totalCases || 0, 
      icon: FolderOpen, 
      color: 'bg-blue-500',
      trend: '+12%'
    },
    { 
      label: 'Pending Validation', 
      value: stats?.pendingValidation || 0, 
      icon: FileCheck, 
      color: 'bg-yellow-500',
      trend: '+5%'
    },
    { 
      label: 'Pending Dispatch', 
      value: stats?.pendingDispatch || 0, 
      icon: Truck, 
      color: 'bg-purple-500',
      trend: '-3%'
    },
    { 
      label: 'Pending Settlement', 
      value: stats?.pendingSettlement || 0, 
      icon: DollarSign, 
      color: 'bg-green-500',
      trend: '+8%'
    },
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'dispatched': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-1">
              Welcome back, {user?.name || user?.username}!
            </h2>
            <p className="text-white/80">
              Here's what's happening with your insurance workflow today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-sm text-white/70">Total Outstanding</p>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalOutstanding || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="metric-card card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="metric-label">{metric.label}</p>
                  <p className="metric-value mt-2">{metric.value.toLocaleString()}</p>
                </div>
                <div className={`w-10 h-10 ${metric.color} rounded-xl flex items-center justify-center text-white`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs font-medium ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend}
                </span>
                <span className="text-xs text-gray-500">vs last week</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg">Branch Summary</h3>
            <Building2 size={20} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {branchSummary?.map((branch, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{branch.name}</p>
                  <p className="text-xs text-gray-500">{branch.cases} cases</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(branch.outstanding)}</p>
                  <p className={`text-xs ${branch.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {branch.trend > 0 ? '+' : ''}{branch.trend}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance/TPA Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg">Insurance/TPA Outstanding</h3>
            <Activity size={20} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {insuranceSummary?.map((insurance, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{insurance.name}</p>
                  <p className="text-xs text-gray-500">{insurance.cases} cases</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(insurance.outstanding)}</p>
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${insurance.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg">Recent Activity</h3>
            <Clock size={20} className="text-gray-400" />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(activity.status)}`}>
                  {activity.status === 'approved' && <CheckCircle size={14} />}
                  {activity.status === 'rejected' && <AlertCircle size={14} />}
                  {activity.status === 'pending' && <Clock size={14} />}
                  {activity.status === 'dispatched' && <Truck size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.user} • {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aging Report */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg">Aging Report</h3>
          <div className="flex gap-2">
            {['7d', '30d', '90d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? 'All Time' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {agingReport?.map((aging, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">{aging.range}</p>
              <p className="text-xl font-bold">{aging.count}</p>
              <p className="text-xs text-primary font-medium">{formatCurrency(aging.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="font-heading font-bold text-lg mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {user?.role === 'branch' && (
            <a href="/cases/new" className="btn-primary">
              <FolderOpen size={18} />
              Create New Case
            </a>
          )}
          {user?.role === 'validation' && (
            <a href="/validation" className="btn-primary">
              <FileCheck size={18} />
              Review Pending Cases
            </a>
          )}
          {user?.role === 'dispatch' && (
            <a href="/dispatch" className="btn-primary">
              <Truck size={18} />
              Manage Dispatch
            </a>
          )}
          {user?.role === 'settlement' && (
            <a href="/settlement" className="btn-primary">
              <DollarSign size={18} />
              Update Settlements
            </a>
          )}
          <a href="/cases" className="btn-secondary">
            View All Cases
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
