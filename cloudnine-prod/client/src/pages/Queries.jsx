import React from 'react'
import { useQuery } from 'react-query'
import { queriesAPI } from '../utils/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { HelpCircle, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const Queries = () => {
  const { data, isLoading } = useQuery(
    'queries',
    () => queriesAPI.getAll().then(r => r.data)
  )

  if (isLoading) return <LoadingSpinner fullScreen />

  const queries = data?.data || []

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    }
    return colors[priority] || 'bg-gray-100 text-gray-700'
  }

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Query Management</h2>
      </div>

      {/* Queries List */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            All Queries
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {queries.map((query) => (
            <div key={query.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{query.subject}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(query.priority)}`}>
                      {query.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                      {query.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{query.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Case: {query.case?.mrn}</span>
                    <span>Branch: {query.case?.branch?.name}</span>
                    <span>By: {query.createdBy?.name || query.createdBy?.username}</span>
                    <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {query.status === 'open' && (
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Resolve">
                      <CheckCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {queries.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No queries found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Queries
