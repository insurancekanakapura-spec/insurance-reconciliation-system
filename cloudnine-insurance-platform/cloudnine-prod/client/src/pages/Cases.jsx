import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { casesAPI } from '../utils/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'

const Cases = () => {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    status: '',
    branch: '',
  })
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, refetch } = useQuery(
    ['cases', page, filters],
    () => casesAPI.getAll({ page, limit, ...filters }).then(r => r.data),
    { keepPreviousData: true }
  )

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      dispatched: 'bg-blue-100 text-blue-700',
      settled: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getStageBadge = (stage) => {
    const stages = {
      STAGE_1: 'Pre-Auth',
      STAGE_2: 'Final Bill',
      STAGE_3: 'Approval',
      STAGE_4: 'Documentation',
    }
    return stages[stage] || stage
  }

  if (isLoading) return <LoadingSpinner fullScreen />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Cases</h2>
        {user?.role === 'branch' && (
          <Link to="/cases/new" className="btn-primary">
            <Plus size={18} />
            New Case
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by MRN or patient name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={filters.stage}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="input w-40"
          >
            <option value="">All Stages</option>
            <option value="STAGE_1">Pre-Auth</option>
            <option value="STAGE_2">Final Bill</option>
            <option value="STAGE_3">Approval</option>
            <option value="STAGE_4">Documentation</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input w-40"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="dispatched">Dispatched</option>
            <option value="settled">Settled</option>
          </select>
          <button className="btn-secondary">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Patient</th>
                <th>Branch</th>
                <th>Insurance/TPA</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Bill Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.mrn}</td>
                  <td>{c.patientName}</td>
                  <td>{c.branch?.name}</td>
                  <td>{c.insuranceTpa?.name || '-'}</td>
                  <td>
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium">
                      {getStageBadge(c.currentStage)}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="font-medium">₹{c.billAmount?.toLocaleString()}</td>
                  <td>
                    <Link
                      to={`/cases/${c.id}`}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.total)} of {data.pagination.total} cases
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cases
