import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'react-query'
import { casesAPI, settingsAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, User, Calendar, DollarSign, Building2, FileText } from 'lucide-react'

const NewCase = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    mrn: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    admissionDate: '',
    dischargeDate: '',
    billAmount: '',
    insuranceTpaId: '',
  })

  const { data: settings } = useQuery('settings', () => settingsAPI.get().then(r => r.data))

  const createMutation = useMutation(
    (data) => casesAPI.create(data),
    {
      onSuccess: (response) => {
        toast.success('Case created successfully')
        navigate(`/cases/${response.data.data.id}`)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create case')
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
        <h2 className="text-2xl font-heading font-bold">Create New Case</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MRN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MRN <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="mrn"
                value={formData.mrn}
                onChange={handleChange}
                placeholder="e.g., CN240001"
                className="input pl-10"
                required
              />
            </div>
          </div>

          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Enter patient name"
                className="input pl-10"
                required
              />
            </div>
          </div>

          {/* Patient Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="patientAge"
              value={formData.patientAge}
              onChange={handleChange}
              placeholder="Enter age"
              className="input"
              min="0"
              max="150"
            />
          </div>

          {/* Patient Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="patientGender"
              value={formData.patientGender}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Admission Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                className="input pl-10"
                required
              />
            </div>
          </div>

          {/* Discharge Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="dischargeDate"
                value={formData.dischargeDate}
                onChange={handleChange}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Bill Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Amount</label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="billAmount"
                value={formData.billAmount}
                onChange={handleChange}
                placeholder="Enter bill amount"
                className="input pl-10"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Insurance/TPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance/TPA</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="insuranceTpaId"
                value={formData.insuranceTpaId}
                onChange={handleChange}
                className="input pl-10"
              >
                <option value="">Select Insurance/TPA</option>
                {settings?.data?.insuranceTPAs?.map((it) => (
                  <option key={it.id} value={it.id}>{it.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={createMutation.isLoading}
            className="btn-primary"
          >
            {createMutation.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Create Case
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewCase
