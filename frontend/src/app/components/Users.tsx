import { useState, useEffect, FormEvent } from 'react'
import { Plus, Mail, Phone, Edit2, Trash2, X, UserCog, CheckCircle, XCircle, Shield, User, Hash, Lock, ChevronRight } from 'lucide-react'
import api from '../../api/axios'

function initials(name: string) { return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }

const AVATAR_GRADIENTS = [
  'from-purple-500 to-purple-700', 'from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700', 'from-rose-500 to-rose-700',
]

const ROLE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Administrador: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  Vendedor: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  Almacenero: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  Supervisor: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
}

const EMPTY_FORM = { usuario: '', nombre: '', id_cargo: '', password: '' }

export function Users() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cargos, setCargos] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)

  const load = async () => {
    const [uRes, cRes] = await Promise.all([api.get('/auth/usuarios/'), api.get('/auth/cargos/')])
    setUsuarios(uRes.data.results || uRes.data); setCargos(cRes.data.results || cRes.data)
  }
  useEffect(() => { load() }, [])

  async function saveUsuario(e: FormEvent) {
    e.preventDefault()
    const payload = { ...form, id_cargo: parseInt(form.id_cargo) }
    if (editId !== null) await api.put(`/auth/usuarios/${editId}/`, payload)
    else await api.post('/auth/usuarios/', payload)
    setEditId(null); setForm(EMPTY_FORM); setShowForm(false); load()
  }

  return (
    <div className="h-full flex flex-col bg-slate-100/60 overflow-hidden text-slate-900" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <div className="p-8 flex-shrink-0">
        <div className="flex items-start justify-between mb-8">
          <div><h1 className="text-2xl font-black text-slate-900 tracking-tighter">Usuarios</h1><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{usuarios.length} Perfiles Activos</p></div>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM) }} className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-xl shadow-slate-200"><Plus className="w-4 h-4" /> Nuevo Acceso</button>
        </div>

        {showForm && (
          <form onSubmit={saveUsuario} className="bg-white rounded-[40px] border-2 border-white shadow-2xl p-8 mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-8"><h3 className="font-black text-slate-900 text-lg tracking-tighter">{editId ? 'Configurar Perfil' : 'Crear Nuevo Acceso'}</h3><button type="button" onClick={() => setShowForm(false)} className="text-slate-300 hover:text-slate-900 transition-all"><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2"><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre y Apellido</label><input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-100 outline-none transition-all" /></div>
              <div><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Usuario de Sistema</label><input required value={form.usuario} onChange={e => setForm({...form, usuario: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-900" /></div>
              <div><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Rol Asignado</label><select required value={form.id_cargo} onChange={e => setForm({...form, id_cargo: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-xs font-bold appearance-none">{cargos.map((c: any) => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña de Seguridad</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-xs font-bold" /></div>
            </div>
            <div className="flex gap-4 mt-8"><button type="submit" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10 active:scale-95 transition-all">Confirmar Cambios</button><button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 border-2 border-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button></div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {usuarios.map((u: any, i: number) => {
            const style = ROLE_STYLE[u.cargo_nombre] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }
            const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
            return (
              <div key={u.id_usuario} className="bg-white rounded-[32px] border-2 border-white shadow-xl shadow-slate-200/50 p-6 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-[20px] bg-gradient-to-br ${grad} flex items-center justify-center text-white text-lg font-black shadow-lg shadow-slate-200`}>{initials(u.nombre)}</div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 text-sm tracking-tight leading-tight truncate">{u.nombre}</h4>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>{u.cargo_nombre}</span>
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 space-y-3">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-slate-400"><Hash className="w-3.5 h-3.5" /><span className="text-[9px] font-black uppercase tracking-widest">Usuario</span></div><span className="text-xs font-bold text-slate-700">{u.usuario}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-slate-400"><Lock className="w-3.5 h-3.5" /><span className="text-[9px] font-black uppercase tracking-widest">Acceso</span></div><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /></div>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-50 flex gap-2">
                  <button onClick={() => { setForm({ usuario: u.usuario, nombre: u.nombre, id_cargo: u.id_cargo.toString(), password: '' }); setEditId(u.id_usuario); setShowForm(true) }} className="flex-1 py-3 rounded-xl border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">Editar</button>
                  <button onClick={async () => { if(confirm('¿Borrar?')){ await api.delete(`/auth/usuarios/${u.id_usuario}/`); load(); } }} className="w-12 py-3 rounded-xl border border-slate-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  )
}
