import { useState, FormEvent, type ElementType } from 'react'
import { User, Lock, Eye, EyeOff, ChevronRight, Shield, ShoppingCart, Package, TrendingUp, Pill, Syringe, Droplets, Heart, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../context/AppContext'

const ROLE_ICONS: Record<UserRole, ElementType> = { Administrador: Shield, Vendedor: ShoppingCart, Almacenero: Package, Supervisor: TrendingUp }
const ROLE_COLORS: Record<UserRole, { gradient: string; text: string }> = {
  Administrador: { gradient: 'from-purple-500 to-purple-700', text: 'text-purple-600' },
  Vendedor: { gradient: 'from-emerald-500 to-emerald-700', text: 'text-emerald-600' },
  Almacenero: { gradient: 'from-blue-500 to-blue-700', text: 'text-blue-600' },
  Supervisor: { gradient: 'from-amber-500 to-amber-700', text: 'text-amber-600' },
}

export function LoginScreen() {
  const { login } = useApp()
  const [selectedRole, setSelectedRole] = useState<UserRole>('Administrador')
  const [username, setUsername] = useState(''); const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!username.trim() || !password.trim()) { setError('Credenciales requeridas'); return }
    setError(''); setLoading(true)
    try { await login(username.trim(), password, selectedRole) }
    catch (err: any) { setError('Acceso denegado') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-slate-50" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      {/* Branding Section */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden flex-col p-16" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex items-center gap-4 mb-auto">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl"><img src="/logo.jpeg" alt="L" className="w-full h-full object-cover" /></div>
          <div><h1 className="text-xl font-black text-white tracking-tighter uppercase">Nova Salud</h1><p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Management System</p></div>
        </div>

        <div className="relative z-10 my-auto max-w-sm">
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[Pill, Syringe, Activity].map((Icon, i) => (
              <div key={i} className="w-16 h-16 rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-xl"><Icon className="w-7 h-7 text-emerald-400" /></div>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter leading-[0.9] mb-6">Eficiencia Clínica,<br/><span className="text-emerald-500">Gestión Inteligente.</span></h2>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">Control total de inventario, ventas y personal bajo la infraestructura más robusta y moderna del mercado farmacéutico.</p>
        </div>
        
        <div className="relative z-10 flex gap-12 mt-auto">
          {[{ v: '2k+', l: 'PRODUCTOS' }, { v: '100%', l: 'SEGURIDAD' }].map((s, i) => (
            <div key={i}><p className="text-2xl font-black text-white tracking-tighter">{s.v}</p><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.l}</p></div>
          ))}
        </div>
      </div>

      {/* Login Section */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Bienvenido</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seleccione su Terminal de Acceso</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {(['Administrador', 'Vendedor', 'Almacenero', 'Supervisor'] as UserRole[]).map((role) => {
              const active = selectedRole === role
              const Icon = ROLE_ICONS[role]
              return (
                <button key={role} type="button" onClick={() => setSelectedRole(role)} 
                  className={`p-4 rounded-[28px] border-2 transition-all flex flex-col items-center gap-3 ${active ? 'bg-white border-slate-900 shadow-2xl shadow-slate-200' : 'bg-slate-100/50 border-transparent hover:bg-slate-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 shadow-sm'}`}><Icon className="w-5 h-5" /></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-400'}`}>{role}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Credencial de Usuario</label>
              <div className="relative group"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-all" /><input required value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full pl-12 pr-4 py-4 rounded-[20px] bg-white border-2 border-slate-50 focus:border-slate-900 outline-none text-xs font-bold shadow-sm transition-all" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Clave de Seguridad</label>
              <div className="relative group"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-all" /><input required type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 rounded-[20px] bg-white border-2 border-slate-50 focus:border-slate-900 outline-none text-xs font-bold shadow-sm transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border border-red-100 animate-shake">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-[24px] text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Validar Identidad <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest mt-10">Nova Salud &copy; 2026 &bull; Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  )
}
