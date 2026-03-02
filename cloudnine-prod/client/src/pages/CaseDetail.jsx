import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { casesAPI } from '../utils/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { ArrowLeft, User, Calendar, DollarSign, Building2, FileText, Clock } from 'lucide-react'

const CaseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery(
    ['case', id],
    () => casesAPI.getById(id).then(r => r.data)
  )

  if (isLoading) return <LoadingSpinner fullScreen />

  const caseData = data?.data

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      dispatched: 'bg-blue-100 text-blue-700',
      settled: 'bg-green-100 text-green-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-heading font-bold">Case {caseData?.mrn}</h2>
          <p className="text-gray-500">{caseData?.patientName}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData?.status)}`}>
          {caseData?.status?.toUpperCase()}
        </span>
      </div>

      {/* Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="card p-6">
          <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Patient Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{caseData?.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Age</span>
              <span className="font-medium">{caseData?.patientAge || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gender</span>
              <span className="font-medium">{caseData?.patientGender || '-'}</span>
            </div>
          </div>
        </div>

        {/* Admission Info */}
        <div className="card p-6">
          <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Admission Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Admission Date</span>
              <span className="font-medium">
                {caseData?.admissionDate ? new Date(caseData.admissionDate).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Discharge Date</span>
              <span className="font-medium">
                {caseData?.dischargeDate ? new Date(caseData.dischargeDate).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Branch</span>
              <span className="font-medium">{caseData?.branch?.name}</span>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="card p-6">
          <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-primary" />
            Financial Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Bill Amount</span>
              <span className="font-medium">₹{caseData?.billAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Approved Amount</span>
              <span className="font-medium">₹{caseData?.approvedAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Settled Amount</span>
              <span className="font-medium">₹{caseData?.settledAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="card p-6">
        <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          Documents
        </h3>
        {caseData?.documents?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {caseData.documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-sm">{doc.fileName}</p>
                <p className="text-xs text-gray-500 mt-1">{doc.type}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
        )}
      </div>

      {/* Activity Log */}
      <div className="card p-6">
        <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          Activity Log
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {caseData?.activities?.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={14} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activity.user?.name || activity.user?.username} • {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CaseDetail
