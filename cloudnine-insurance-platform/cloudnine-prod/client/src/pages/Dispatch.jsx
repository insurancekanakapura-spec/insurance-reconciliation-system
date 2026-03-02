import React from 'react'
import { useQuery } from 'react-query'
import { dispatchAPI } from '../utils/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { Truck, Package, CheckCircle, Eye } from 'lucide-react'

const Dispatch = () => {
  const { data: pendingData, isLoading: pendingLoading } = useQuery(
    'dispatchPending',
    () => dispatchAPI.getPending().then(r => r.data)
  )

  const { data: statsData } = useQuery(
    'dispatchStats',
    () => dispatchAPI.getStats().then(r => r.data)
  )

  if (pendingLoading) return <LoadingSpinner fullScreen />

  const pendingCases = pendingData?.data || []
  const stats = statsData?.data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Dispatch Management</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="metric-label">Pending Dispatch</p>
          <p className="metric-value text-primary">{pendingCases.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Dispatched</p>
          <p className="metric-value">{stats.totalDispatched || 0}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Pending POD</p>
          <p className="metric-value text-yellow-600">{stats.pendingPOD || 0}</p>
        </div>
      </div>

      {/* Pending Cases */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Pending Dispatch
          </h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Patient</th>
                <th>Branch</th>
                <th>Insurance/TPA</th>
                <th>Bill Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingCases.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.mrn}</td>
                  <td>{c.patientName}</td>
                  <td>{c.branch?.name}</td>
                  <td>{c.insuranceTpa?.name || '-'}</td>
                  <td>₹{c.billAmount?.toLocaleString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Mark Dispatched">
                        <Truck size={18} />
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
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No pending dispatches</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dispatch
