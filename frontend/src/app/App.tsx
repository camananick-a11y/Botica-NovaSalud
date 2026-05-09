import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import type { UserRole } from './context/AppContext'
import { LoginScreen } from './components/LoginScreen'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { Medications } from './components/Medications'
import { Sales } from './components/Sales'
import { Customers } from './components/Customers'
import { Users } from './components/Users'

const DEFAULT_MODULE: Record<UserRole, string> = {
  Administrador: 'dashboard',
  Vendedor: 'sales',
  Almacenero: 'medications',
  Supervisor: 'dashboard',
}

function AppShell() {
  const { user, loading } = useApp()
  const [module, setModule] = useState('dashboard')

  useEffect(() => {
    if (user) {
      setModule(DEFAULT_MODULE[user.role])
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

  const active = module

  return (
    <Layout active={active} setActive={setModule}>
      {active === 'dashboard' && <Dashboard setModule={setModule} />}
      {active === 'medications' && <Medications />}
      {active === 'sales' && <Sales />}
      {active === 'customers' && <Customers />}
      {active === 'users' && user.role === 'Administrador' && <Users />}
    </Layout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
