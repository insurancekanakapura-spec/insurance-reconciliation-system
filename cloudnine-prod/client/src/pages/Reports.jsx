import React from 'react'
import { BarChart3, Download, FileText, TrendingUp, Calendar } from 'lucide-react'

const Reports = () => {
  const reports = [
    {
      title: 'Cases Report',
      description: 'Complete case listing with all details',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Validation Report',
      description: 'Validation decisions and turnaround times',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Settlement Report',
      description: 'Payment tracking and outstanding amounts',
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      title: 'Aging Report',
      description: 'Outstanding cases by age buckets',
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Reports</h2>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon
          return (
            <div key={index} className="card p-6 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center text-white`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">{report.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{report.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn-primary flex-1">
                  <BarChart3 size={18} />
                  View Report
                </button>
                <button className="btn-secondary">
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Date Range Filter */}
      <div className="card p-6">
        <h3 className="font-heading font-bold text-lg mb-4">Custom Report</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select className="input w-48">
              <option value="">All Branches</option>
              <option value="bng01">Jayanagar</option>
              <option value="bng02">Old Airport Road</option>
              <option value="bng03">Malleswaram</option>
              <option value="bng04">Bellandur</option>
              <option value="bng05">Indiranagar</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary">
              <Download size={18} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
