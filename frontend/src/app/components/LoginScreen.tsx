import { useState, FormEvent, type ElementType } from 'react'
import { User, Lock, Eye, EyeOff, ChevronRight, Shield, ShoppingCart, Package, TrendingUp, CheckCircle2, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../context/AppContext'

const ROLE_ICONS: Record<UserRole, ElementType> = { Administrador: Shield, Vendedor: ShoppingCart, Almacenero: Package, Supervisor: TrendingUp }

const ROLE_COLORS: Record<UserRole, { iconBg: string; iconText: string; border: string; activeBorder: string }> = {
  Administrador: { iconBg: 'bg-[#4EA0FC]/15', iconText: 'text-[#4EA0FC]', border: 'border-[#2A3B56]', activeBorder: 'border-[#4EA0FC]' },
  Vendedor: { iconBg: 'bg-[#19CF8D]/15', iconText: 'text-[#19CF8D]', border: 'border-[#2A3B56]', activeBorder: 'border-[#19CF8D]' },
  Almacenero: { iconBg: 'bg-[#8CA3E6]/15', iconText: 'text-[#8CA3E6]', border: 'border-[#2A3B56]', activeBorder: 'border-[#8CA3E6]' },
  Supervisor: { iconBg: 'bg-[#6E8FCF]/15', iconText: 'text-[#6E8FCF]', border: 'border-[#2A3B56]', activeBorder: 'border-[#6E8FCF]' },
}

const TEST_CREDENTIALS: Record<UserRole, { user: string; pass: string }> = {
  Administrador: { user: 'admin', pass: 'admin123' },
  Vendedor: { user: 'vendedor1', pass: 'vendedor123' },
  Almacenero: { user: 'almacen1', pass: 'almacen123' },
  Supervisor: { user: 'supervisor1', pass: 'super123' },
}

export function LoginScreen() {
  const { login } = useApp()
  const [selectedRole, setSelectedRole] = useState<UserRole>('Administrador')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Credenciales requeridas')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), password, selectedRole)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Acceso denegado')
    } finally {
      setLoading(false)
    }
  }

  function autofillCredentials() {
    const creds = TEST_CREDENTIALS[selectedRole]
    setUsername(creds.user)
    setPassword(creds.pass)
    setError('')
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#162033] via-[#1B263B] to-[#162033]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#4EA0FC]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#19CF8D]/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#8CA3E6]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          <div className="med-card-dark p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#2A3B56] bg-[#24324A] ring-2 ring-[#4EA0FC]/30">
                  <img src="/logo.jpeg" alt="Nova Salud" className="w-full h-full object-cover" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-[#E8F0FE] tracking-tighter mb-1">Nova Salud</h1>
              <p className="text-[#19CF8D] text-xs font-black uppercase tracking-[0.2em]">Sistema Farmacéutico Inteligente</p>
              <p className="text-[#8CA3E6] text-[13px] mt-3">Gestión integral de inventario, ventas y personal para farmacias empresariales</p>
            </div>

            <div className="mb-6">
              <p className="med-section-title mb-3 text-center">Seleccione su terminal de acceso</p>
              <div className="grid grid-cols-2 gap-3">
                {(['Administrador', 'Vendedor', 'Almacenero', 'Supervisor'] as UserRole[]).map((role) => {
                  const active = selectedRole === role
                  const Icon = ROLE_ICONS[role]
                  const colors = ROLE_COLORS[role]
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => { setSelectedRole(role); setError('') }}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${active
                          ? `bg-[#24324A] ${colors.activeBorder} shadow-lg`
                          : `bg-[#1B263B]/60 ${colors.border} hover:bg-[#24324A]`
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                          ${active
                            ? 'bg-gradient-to-br from-[#4EA0FC] to-[#3B82F6] text-white'
                            : `${colors.iconBg} ${colors.iconText}`
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-[#E8F0FE]' : 'text-[#8CA3E6]'}`}>{role}</span>
                      </div>
                      {active && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-[#19CF8D] rounded-full shadow-lg shadow-[#19CF8D]/50 animate-pulse" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="med-label">Usuario</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7FB8]" />
                  <input
                    required
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError('') }}
                    placeholder="Ingrese su usuario"
                    className="med-input pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="med-label">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7FB8]" />
                  <input
                    required
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                    className="med-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5F7FB8] hover:text-[#4EA0FC] p-1.5 rounded-lg transition-all"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={autofillCredentials}
                className="w-full text-[10px] font-bold text-[#19CF8D] uppercase tracking-widest py-2.5 px-4 rounded-xl border border-[#19CF8D]/30 hover:border-[#19CF8D]/60 bg-[#19CF8D]/5 hover:bg-[#19CF8D]/10 transition-all active:scale-95"
              >
                ↻ Usar credenciales de prueba
              </button>

              {error && (
                <div className="bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl border border-[#EF4444]/30 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  loading
                    ? 'bg-[#24324A] text-[#5F7FB8] cursor-not-allowed'
                    : 'med-btn-primary'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    {success ? <CheckCircle2 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    Acceder al Sistema
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-[9px] font-bold text-[#8CA3E6] uppercase tracking-widest">Credenciales de Demostración</p>
              <div className="flex justify-center gap-2 text-[8px] text-[#5F7FB8]">
                <span className="bg-[#24324A] px-3 py-1.5 rounded-lg font-mono border border-[#2A3B56]">admin / admin123</span>
                <span className="bg-[#24324A] px-3 py-1.5 rounded-lg font-mono border border-[#2A3B56]">vendedor1 / vendedor123</span>
              </div>
              <p className="text-[8px] font-bold text-[#5F7FB8] uppercase tracking-widest pt-1">Nova Salud &copy; 2026 • Farmacia Empresarial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
