import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// UI Store
export const useUIStore = create(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Notifications
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { id: Date.now(), ...notification }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Modals
      activeModal: null,
      modalData: null,
      openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Filters
      filters: {},
      setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
      })),
      clearFilters: () => set({ filters: {} }),
    }),
    {
      name: 'cloudnine-ui-store',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen, theme: state.theme }),
    }
  )
)

// Cases Store
export const useCasesStore = create((set, get) => ({
  cases: [],
  selectedCase: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    branch: '',
    stage: '',
    status: '',
    insurance: '',
    dateFrom: '',
    dateTo: '',
  },

  setCases: (cases) => set({ cases }),
  setSelectedCase: (selectedCase) => set({ selectedCase }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({
    filters: {
      search: '',
      branch: '',
      stage: '',
      status: '',
      insurance: '',
      dateFrom: '',
      dateTo: '',
    }
  }),

  // Computed
  getFilteredCases: () => {
    const { cases, filters } = get()
    return cases.filter((c) => {
      if (filters.search && !c.mrn?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !c.patientName?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.branch && c.branch !== filters.branch) return false
      if (filters.stage && c.stage !== filters.stage) return false
      if (filters.status && c.status !== filters.status) return false
      if (filters.insurance && c.insurance !== filters.insurance) return false
      return true
    })
  },
}))

// Dashboard Store
export const useDashboardStore = create((set) => ({
  stats: {
    totalCases: 0,
    pendingValidation: 0,
    pendingDispatch: 0,
    pendingSettlement: 0,
    totalOutstanding: 0,
    avgTAT: 0,
  },
  branchSummary: [],
  insuranceSummary: [],
  recentActivity: [],
  agingReport: [],
  loading: false,

  setStats: (stats) => set({ stats }),
  setBranchSummary: (branchSummary) => set({ branchSummary }),
  setInsuranceSummary: (insuranceSummary) => set({ insuranceSummary }),
  setRecentActivity: (recentActivity) => set({ recentActivity }),
  setAgingReport: (agingReport) => set({ agingReport }),
  setLoading: (loading) => set({ loading }),
}))

// Validation Store
export const useValidationStore = create((set) => ({
  pendingCases: [],
  history: [],
  stats: {
    totalReviewed: 0,
    approvedToday: 0,
    rejectedToday: 0,
    avgReviewTime: 0,
  },
  loading: false,

  setPendingCases: (pendingCases) => set({ pendingCases }),
  setHistory: (history) => set({ history }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}))

// Dispatch Store
export const useDispatchStore = create((set) => ({
  pendingCases: [],
  history: [],
  stats: {
    totalDispatched: 0,
    pendingPOD: 0,
    avgDispatchTime: 0,
  },
  loading: false,

  setPendingCases: (pendingCases) => set({ pendingCases }),
  setHistory: (history) => set({ history }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}))

// Settlement Store
export const useSettlementStore = create((set) => ({
  pendingCases: [],
  history: [],
  stats: {
    totalSettled: 0,
    totalOutstanding: 0,
    shortPaidAmount: 0,
    avgSettlementTime: 0,
  },
  loading: false,

  setPendingCases: (pendingCases) => set({ pendingCases }),
  setHistory: (history) => set({ history }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}))

// Users Store
export const useUsersStore = create((set) => ({
  users: [],
  selectedUser: null,
  loading: false,

  setUsers: (users) => set({ users }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setLoading: (loading) => set({ loading }),

  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((u) => u.id === id ? { ...u, ...updates } : u)
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter((u) => u.id !== id)
  })),
}))

// Queries Store
export const useQueriesStore = create((set) => ({
  queries: [],
  selectedQuery: null,
  loading: false,

  setQueries: (queries) => set({ queries }),
  setSelectedQuery: (selectedQuery) => set({ selectedQuery }),
  setLoading: (loading) => set({ loading }),

  addQuery: (query) => set((state) => ({ queries: [query, ...state.queries] })),
  updateQuery: (id, updates) => set((state) => ({
    queries: state.queries.map((q) => q.id === id ? { ...q, ...updates } : q)
  })),
  resolveQuery: (id, resolution) => set((state) => ({
    queries: state.queries.map((q) => 
      q.id === id ? { ...q, status: 'resolved', resolution, resolvedAt: new Date() } : q
    )
  })),
}))

export default useCasesStore
