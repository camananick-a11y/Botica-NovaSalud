import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import type { UserRole } from './context/AppContext'
import { LoginScreen } from './components/LoginScreen'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { Medications } from './components/Medications'
import { Sales } from './components/Sales'
import { Customers } from './components/Customers'
import { Users } from './components/Users'
import { ProductSales } from './components/ProductSales'
import { ErrorBoundary } from './components/ErrorBoundary'

const DEFAULT_MODULE: Record<UserRole, string> = {
  Administrador: 'dashboard',
  Vendedor: 'sales',
  Almacenero: 'medications',
  Supervisor: 'dashboard',
}

function AppShell() {
  const { user, loading } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(DEFAULT_MODULE[user.role], { replace: true })
    }
  }, [user?.role])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to={DEFAULT_MODULE[user.role]} replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/product-sales" element={<ProductSales />} />
          <Route path="/users" element={user.role === 'Administrador' ? <Users /> : <Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to={DEFAULT_MODULE[user.role]} replace />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  )
}
