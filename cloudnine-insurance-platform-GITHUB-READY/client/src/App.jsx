import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import LoadingSpinner from './components/UI/LoadingSpinner'

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Cases = lazy(() => import('./pages/Cases'))
const CaseDetail = lazy(() => import('./pages/CaseDetail'))
const NewCase = lazy(() => import('./pages/NewCase'))
const Validation = lazy(() => import('./pages/Validation'))
const Dispatch = lazy(() => import('./pages/Dispatch'))
const Settlement = lazy(() => import('./pages/Settlement'))
const Queries = lazy(() => import('./pages/Queries'))
const Users = lazy(() => import('./pages/Users'))
const Settings = lazy(() => import('./pages/Settings'))
const Reports = lazy(() => import('./pages/Reports'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
        />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cases" 
            element={
              <ProtectedRoute allowedRoles={['branch', 'validation', 'dispatch', 'settlement', 'admin']}>
                <Cases />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cases/new" 
            element={
              <ProtectedRoute allowedRoles={['branch', 'admin']}>
                <NewCase />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cases/:id" 
            element={
              <ProtectedRoute allowedRoles={['branch', 'validation', 'dispatch', 'settlement', 'admin']}>
                <CaseDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/validation" 
            element={
              <ProtectedRoute allowedRoles={['validation', 'admin']}>
                <Validation />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dispatch" 
            element={
              <ProtectedRoute allowedRoles={['dispatch', 'admin']}>
                <Dispatch />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settlement" 
            element={
              <ProtectedRoute allowedRoles={['settlement', 'admin']}>
                <Settlement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/queries" 
            element={
              <ProtectedRoute allowedRoles={['branch', 'validation', 'dispatch', 'settlement', 'admin']}>
                <Queries />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['validation', 'dispatch', 'settlement', 'admin']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
