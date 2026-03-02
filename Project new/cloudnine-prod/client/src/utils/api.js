import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/password', data),
}

// Cases API
export const casesAPI = {
  getAll: (params) => api.get('/cases', { params }),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.patch(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`),
  uploadDocument: (id, stage, formData) => api.post(`/cases/${id}/documents/${stage}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  validateDocument: (id, stage) => api.post(`/cases/${id}/validate/${stage}`),
  approveStage: (id, stage, data) => api.post(`/cases/${id}/approve/${stage}`, data),
  rejectStage: (id, stage, data) => api.post(`/cases/${id}/reject/${stage}`, data),
  addQuery: (id, data) => api.post(`/cases/${id}/queries`, data),
  resolveQuery: (id, queryId, data) => api.patch(`/cases/${id}/queries/${queryId}`, data),
  bulkUpload: (formData) => api.post('/cases/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Validation API
export const validationAPI = {
  getPending: (params) => api.get('/validation/pending', { params }),
  getHistory: (params) => api.get('/validation/history', { params }),
  approve: (caseId, stage, data) => api.post(`/validation/${caseId}/approve/${stage}`, data),
  reject: (caseId, stage, data) => api.post(`/validation/${caseId}/reject/${stage}`, data),
  getStats: () => api.get('/validation/stats'),
}

// Dispatch API
export const dispatchAPI = {
  getPending: (params) => api.get('/dispatch/pending', { params }),
  getHistory: (params) => api.get('/dispatch/history', { params }),
  uploadPOD: (caseId, formData) => api.post(`/dispatch/${caseId}/pod`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  markDispatched: (caseId, data) => api.post(`/dispatch/${caseId}/dispatch`, data),
  getStats: () => api.get('/dispatch/stats'),
}

// Settlement API
export const settlementAPI = {
  getPending: (params) => api.get('/settlement/pending', { params }),
  getHistory: (params) => api.get('/settlement/history', { params }),
  updatePayment: (caseId, data) => api.patch(`/settlement/${caseId}/payment`, data),
  bulkUpdate: (data) => api.post('/settlement/bulk', data),
  getStats: () => api.get('/settlement/stats'),
  exportExcel: (params) => api.get('/settlement/export', { 
    params,
    responseType: 'blob'
  }),
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getBranchSummary: () => api.get('/dashboard/branch-summary'),
  getInsuranceSummary: () => api.get('/dashboard/insurance-summary'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getAgingReport: () => api.get('/dashboard/aging-report'),
}

// Queries API
export const queriesAPI = {
  getAll: (params) => api.get('/queries', { params }),
  getByCase: (caseId) => api.get(`/queries/case/${caseId}`),
  create: (data) => api.post('/queries', data),
  update: (id, data) => api.patch(`/queries/${id}`, data),
  resolve: (id, data) => api.patch(`/queries/${id}/resolve`, data),
}

// Reports API
export const reportsAPI = {
  getCases: (params) => api.get('/reports/cases', { params }),
  getValidation: (params) => api.get('/reports/validation', { params }),
  getSettlement: (params) => api.get('/reports/settlement', { params }),
  export: (type, params) => api.get(`/reports/export/${type}`, {
    params,
    responseType: 'blob'
  }),
}

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.patch('/settings', data),
  getBranches: () => api.get('/settings/branches'),
  getInsuranceTPAs: () => api.get('/settings/insurance-tpas'),
}

export default api
