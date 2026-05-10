import { useState, useEffect, useRef, type ReactNode, type ElementType } from 'react'
import { LayoutDashboard, Package, ShoppingCart, Users, UserCog, Bell, LogOut, Menu, X, AlertTriangle, Package as PackageIcon, X as XIcon } from 'lucide-react'
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
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const fetchAlerts = () => {
    api.get('/ventas/comprobantes/stock_bajo/', { params: { umbral: 10 } })
      .then(({ data }) => {
        setAlertCount(data.length)
        setNotifications(data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  useEffect(() => {
    if (!showNotif) return
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotif])

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
            <div className="relative" ref={notifRef}>
              <button onClick={() => { if (!showNotif) fetchAlerts(); setShowNotif(!showNotif) }} className="w-9 h-9 rounded-lg border border-[#2A3B56] flex items-center justify-center text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              {alertCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">{alertCount}</span>}
              {showNotif && (
                <div className="absolute right-0 top-12 w-80 bg-[#1B263B] border border-[#2A3B56] rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#2A3B56] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#E8F0FE]">Notificaciones</h3>
                    <button onClick={() => setShowNotif(false)} className="text-[#8CA3E6] hover:text-[#E8F0FE]">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Package className="w-8 h-8 text-[#19CF8D] mx-auto mb-2" />
                        <p className="text-sm font-medium text-[#8CA3E6]">Todo en orden</p>
                        <p className="text-[10px] text-[#5F7FB8]">No hay productos con stock crítico</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="px-4 py-3 border-b border-[#2A3B56]/50 hover:bg-[#24324A] transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-[#E8F0FE] truncate">{n.medicamento}</p>
                              <p className="text-[10px] text-[#EF4444] mt-0.5">Stock crítico: {n.cantidad_actual} unidades</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-[#2A3B56] bg-[#162033]">
                      <button onClick={() => setActive('medications')} className="w-full text-center text-[10px] font-bold text-[#4EA0FC] uppercase tracking-wider hover:text-[#B5CEFF] transition-colors">
                        Ir a Inventario
                      </button>
                    </div>
                  )}
                </div>
              )}
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
