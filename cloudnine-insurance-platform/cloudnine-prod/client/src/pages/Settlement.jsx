import React from 'react'
import { useQuery } from 'react-query'
import { settlementAPI } from '../utils/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { DollarSign, CreditCard, TrendingUp, Eye, Download } from 'lucide-react'

const Settlement = () => {
  const { data: pendingData, isLoading: pendingLoading } = useQuery(
    'settlementPending',
    () => settlementAPI.getPending().then(r => r.data)
  )

  const { data: statsData } = useQuery(
    'settlementStats',
    () => settlementAPI.getStats().then(r => r.data)
  )

  if (pendingLoading) return <LoadingSpinner fullScreen />

  const pendingCases = pendingData?.data || []
  const stats = statsData?.data || {}

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Settlement Tracking</h2>
        <button className="btn-secondary">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="metric-label">Pending Settlement</p>
          <p className="metric-value text-primary">{pendingCases.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Outstanding</p>
          <p className="metric-value">{formatCurrency(stats.totalOutstanding)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Settled</p>
          <p className="metric-value text-green-600">{stats.totalSettled || 0}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Short Paid Amount</p>
          <p className="metric-value text-red-600">{formatCurrency(stats.shortPaidAmount)}</p>
        </div>
      </div>

      {/* Pending Cases */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            Pending Settlement
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
                <th>Approved Amount</th>
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
                  <td>{formatCurrency(c.billAmount)}</td>
                  <td>{formatCurrency(c.approvedAmount)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Record Payment">
                        <DollarSign size={18} />
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
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No pending settlements</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settlement
