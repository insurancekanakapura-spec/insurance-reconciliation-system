import React from 'react'
import { useQuery } from 'react-query'
import { validationAPI } from '../utils/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { FileCheck, CheckCircle, XCircle, HelpCircle, Eye } from 'lucide-react'

const Validation = () => {
  const { data: pendingData, isLoading: pendingLoading } = useQuery(
    'validationPending',
    () => validationAPI.getPending().then(r => r.data)
  )

  const { data: statsData } = useQuery(
    'validationStats',
    () => validationAPI.getStats().then(r => r.data)
  )

  if (pendingLoading) return <LoadingSpinner fullScreen />

  const pendingCases = pendingData?.data || []
  const stats = statsData?.data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Validation Queue</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="metric-label">Pending Review</p>
          <p className="metric-value text-primary">{pendingCases.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Reviewed</p>
          <p className="metric-value">{stats.totalReviewed || 0}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Approved Today</p>
          <p className="metric-value text-green-600">{stats.approvedToday || 0}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Rejected Today</p>
          <p className="metric-value text-red-600">{stats.rejectedToday || 0}</p>
        </div>
      </div>

      {/* Pending Cases */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <FileCheck size={20} className="text-primary" />
            Pending Validation
          </h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Patient</th>
                <th>Branch</th>
                <th>Stage</th>
                <th>Bill Amount</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingCases.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.mrn}</td>
                  <td>{c.patientName}</td>
                  <td>{c.branch?.name}</td>
                  <td>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {c.currentStage}
                    </span>
                  </td>
                  <td>₹{c.billAmount?.toLocaleString()}</td>
                  <td>{c._count?.documents || 0} files</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                        <CheckCircle size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                        <XCircle size={18} />
                      </button>
                      <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Query">
                        <HelpCircle size={18} />
                      </button>
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="View">
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pendingCases.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FileCheck size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No pending validations</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Validation
