import { useState, useEffect, type ReactNode, type ElementType } from 'react'
import { LayoutDashboard, Package, ShoppingCart, Users, UserCog, Bell, LogOut, Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../context/AppContext'
import api from '../../api/axios'

interface NavItem {
  id: string
  label: string
  Icon: ElementType
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  Administrador: [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'medications', label: 'Inventario', Icon: Package },
    { id: 'sales', label: 'Ventas', Icon: ShoppingCart },
    { id: 'customers', label: 'Clientes', Icon: Users },
    { id: 'users', label: 'Usuarios', Icon: UserCog },
  ],
  Vendedor: [
    { id: 'sales', label: 'Nueva Venta', Icon: ShoppingCart },
    { id: 'medications', label: 'Medicamentos', Icon: Package },
    { id: 'customers', label: 'Clientes', Icon: Users },
  ],
  Almacenero: [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'medications', label: 'Inventario', Icon: Package },
  ],
  Supervisor: [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'sales', label: 'Ventas', Icon: ShoppingCart },
    { id: 'customers', label: 'Clientes', Icon: Users },
  ],
}

const MODULE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard Principal',
  medications: 'Inventario de Productos',
  sales: 'Módulo de Ventas',
  customers: 'Cartera de Clientes',
  users: 'Gestión de Personal',
}

interface LayoutProps {
  active: string
  setActive: (id: string) => void
  children: ReactNode
}

export function Layout({ active, setActive, children }: LayoutProps) {
  const { user, logout } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    api.get('/ventas/comprobantes/stock_bajo/', { params: { umbral: 10 } })
      .then(({ data }) => setAlertCount(data.length))
      .catch(() => {})
  }, [])

  if (!user) return null

  const navItems = NAV_BY_ROLE[user.role]
  const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <div className={`fixed inset-0 z-30 bg-black/40 lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1B263B] border-r border-[#2A3B56] transition-all duration-300 ease-in-out ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-72 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-5 border-b border-[#2A3B56]">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-[#4EA0FC]/40"><img src="/logo.jpeg" alt="NovaSalud" className="w-full h-full object-cover" /></div>
          {!collapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <span className="text-sm font-bold text-[#E8F0FE] tracking-tight truncate block">Nova Salud</span>
              <span className="text-[9px] font-medium text-[#8CA3E6] uppercase tracking-wider">Farmacia</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto w-8 h-8 rounded-lg text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] hidden lg:flex items-center justify-center transition-colors">
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setActive(id); setMobileOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium relative group ${
                active === id
                  ? 'bg-gradient-to-r from-[#4EA0FC]/15 to-[#19CF8D]/8 text-[#E8F0FE] border border-[#4EA0FC]/30 shadow-sm'
                  : 'text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A]'
              }`}>
              <Icon className={`w-5 h-5 flex-shrink-0 ${active === id ? 'text-[#4EA0FC]' : ''}`} />
              {!collapsed && <span>{label}</span>}
              {id === 'medications' && alertCount > 0 && (
                <span className={`ml-auto bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none ${collapsed ? 'absolute -top-0.5 -right-0.5' : ''}`}>{alertCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[#2A3B56]">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#24324A] mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4EA0FC] to-[#19CF8D] flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">{user.avatar}</div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#E8F0FE] truncate">{user.name}</p>
                <p className="text-[9px] font-medium text-[#8CA3E6] uppercase tracking-wider">{user.role}</p>
              </div>
            )}
          </div>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#8CA3E6] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all text-sm font-medium">
            <LogOut className="w-5 h-5" /> {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-[#1B263B]/80 backdrop-blur-md border-b border-[#2A3B56] flex items-center px-6 gap-4 flex-shrink-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="w-9 h-9 rounded-lg border border-[#2A3B56] flex items-center justify-center text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] lg:hidden transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-[#E8F0FE] leading-tight">{MODULE_TITLES[active] ?? 'Panel'}</h1>
            <p className="text-[10px] text-[#8CA3E6] capitalize">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-9 h-9 rounded-lg border border-[#2A3B56] flex items-center justify-center text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              {alertCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">{alertCount}</span>}
            </div>
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#2A3B56]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4EA0FC] to-[#19CF8D] flex items-center justify-center text-white text-xs font-bold shadow-md">{user.avatar}</div>
              <span className="hidden sm:block text-sm font-medium text-[#E8F0FE]">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 h-full overflow-hidden flex flex-col">{children}</main>
      </div>
    </div>
  )
}
