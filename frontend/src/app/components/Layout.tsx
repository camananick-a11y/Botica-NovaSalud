import { useState, useEffect, type ReactNode, type ElementType } from 'react'
import { LayoutDashboard, Package, ShoppingCart, Users, UserCog, Bell, LogOut, Menu, X, ChevronDown, AlertTriangle, TrendingUp } from 'lucide-react'
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
    <div className="flex h-full bg-background text-foreground overflow-hidden">
      {/* Mobile backdrop */}
      <div className={`fixed inset-0 z-30 bg-slate-900/60 lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileOpen(false)} />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-foreground transition-all duration-300 ease-in-out ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-72 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 shadow-sm"><img src="/logo.jpeg" alt="L" className="w-full h-full object-cover" /></div>
          {!collapsed && <span className="ml-3 text-white font-black text-xs tracking-widest uppercase truncate">Nova Salud</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-500 hover:text-white hidden lg:block"><Menu className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-none">
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setActive(id); setMobileOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest relative group ${active === id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active === id ? 'scale-110' : ''}`} />
              {!collapsed && <span>{label}</span>}
              {id === 'medications' && alertCount > 0 && (
                <span className={`ml-auto bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md ${collapsed ? 'absolute top-1 right-1' : ''}`}>{alertCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-[10px] font-black uppercase tracking-widest"><LogOut className="w-4 h-4" /> {!collapsed && <span>Salir</span>}</button>
        </div>
      </aside>

      {/* Main spacer */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`} />

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-8 gap-4 flex-shrink-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 lg:hidden"><Menu className="w-5 h-5" /></button>
          <div className="min-w-0">
            <h1 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase leading-none mb-1">{MODULE_TITLES[active] ?? 'Panel'}</h1>
            <p className="text-sm font-black text-foreground tracking-tighter capitalize">{dateStr}</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-[10px] font-black shadow-sm">{user.avatar}</div>
              <span className="hidden sm:block text-[10px] font-black text-slate-600 uppercase tracking-widest">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 h-full overflow-hidden flex flex-col">{children}</main>
      </div>
    </div>
  )
}
