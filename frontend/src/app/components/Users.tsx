import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Hash, Lock, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import { ConfirmModal } from './ConfirmModal'

function initials(name: string) { return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }

const AVATAR_GRADIENTS = [
  'from-[#4EA0FC] to-[#3B82F6]', 'from-[#19CF8D] to-[#15B87C]', 'from-[#8CA3E6] to-[#6E8FCF]',
  'from-[#6E8FCF] to-[#5F7FB8]', 'from-[#7A96D6] to-[#5F7FB8]',
]

const ROLE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Administrador: { bg: 'bg-[#4EA0FC]/15', text: 'text-[#4EA0FC]', border: 'border-[#4EA0FC]/25' },
  Vendedor: { bg: 'bg-[#19CF8D]/15', text: 'text-[#19CF8D]', border: 'border-[#19CF8D]/25' },
  Almacenero: { bg: 'bg-[#8CA3E6]/15', text: 'text-[#8CA3E6]', border: 'border-[#8CA3E6]/25' },
  Supervisor: { bg: 'bg-[#6E8FCF]/15', text: 'text-[#6E8FCF]', border: 'border-[#6E8FCF]/25' },
}

function AddUserModal({ onClose, onSuccess, cargos, editUser }: { onClose: () => void; onSuccess: () => void; cargos: any[]; editUser?: any }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(editUser ? { usuario: editUser.usuario, nombre: editUser.nombre, id_cargo: editUser.id_cargo.toString(), password: '' } : { usuario: '', nombre: '', id_cargo: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, id_cargo: parseInt(form.id_cargo) }
      if (editUser) await api.put(`/auth/usuarios/${editUser.id_usuario}/`, payload)
      else await api.post('/auth/usuarios/', payload)
      onSuccess()
    } catch { alert('Error al guardar usuario') } finally { setSaving(false) }
  }

  return (
    <div className="med-modal-overlay" style={{ zIndex: 100 }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="med-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#2A3B56] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#E8F0FE]">{editUser ? 'Configurar Perfil' : 'Nuevo Acceso'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-[#2A3B56] text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] transition-all flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <div className="space-y-3">
            <p className="med-section-title">Datos Personales</p>
            <div>
              <label className="med-label">Nombre y Apellido</label>
              <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                className="med-input" placeholder="Ej: Carlos García" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="med-section-title">Credenciales</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="med-label">Usuario de Sistema</label>
                <input required value={form.usuario} onChange={e => setForm({...form, usuario: e.target.value})}
                  className="med-input" placeholder="ej: vendedor1" />
              </div>
              <div>
                <label className="med-label">Rol Asignado</label>
                <select required value={form.id_cargo} onChange={e => setForm({...form, id_cargo: e.target.value})}
                  className="med-select">
                  <option value="">Seleccionar...</option>
                  {cargos.map((c: any) => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="med-label">Contraseña {editUser && '(dejar en blanco para mantener)'}</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="med-input" placeholder="••••••••" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="med-btn-secondary flex-1 text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="med-btn-primary flex-[2] text-sm">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Plus className="w-4 h-4" /> {editUser ? 'Confirmar Cambios' : 'Crear Usuario'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Users() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cargos, setCargos] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)

  const load = async () => {
    const [uRes, cRes] = await Promise.all([api.get('/auth/usuarios/'), api.get('/auth/cargos/')])
    setUsuarios(uRes.data.results || uRes.data); setCargos(cRes.data.results || cRes.data)
  }
  useEffect(() => { load() }, [])

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden text-[#E8F0FE]">
      <div className="p-8 flex-shrink-0">
        <div className="flex items-start justify-between mb-8">
          <div><h1 className="text-2xl font-black text-[#E8F0FE] tracking-tighter">Usuarios</h1><p className="med-section-title mt-1.5">{usuarios.length} Perfiles Activos</p></div>
          <button onClick={() => { setShowForm(true); setEditUser(null) }} className="med-btn-primary text-[10px] uppercase tracking-widest"><Plus className="w-4 h-4" /> Nuevo Acceso</button>
        </div>

        {showForm && <AddUserModal cargos={cargos} editUser={editUser} onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); setEditUser(null); load() }} />}
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-thin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {usuarios.map((u: any, i: number) => {
            const style = ROLE_STYLE[u.cargo_nombre] || { bg: 'bg-[#24324A]', text: 'text-[#8CA3E6]', border: 'border-[#2A3B56]' }
            const grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
            return (
              <div key={u.id_usuario} className="med-card-dark p-6 flex flex-col hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-[20px] bg-gradient-to-br ${grad} flex items-center justify-center text-white text-lg font-black`}>{initials(u.nombre)}</div>
                  <div className="min-w-0">
                    <h4 className="font-black text-[#E8F0FE] text-sm tracking-tight leading-tight truncate">{u.nombre}</h4>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>{u.cargo_nombre}</span>
                  </div>
                </div>
                <div className="bg-[#24324A] rounded-2xl p-4 border border-[#2A3B56] space-y-3">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[#8CA3E6]"><Hash className="w-3.5 h-3.5" /><span className="text-[9px] font-black uppercase tracking-widest">Usuario</span></div><span className="text-xs font-bold text-[#E8F0FE]">{u.usuario}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[#8CA3E6]"><Lock className="w-3.5 h-3.5" /><span className="text-[9px] font-black uppercase tracking-widest">Acceso</span></div><div className="w-2 h-2 rounded-full bg-[#19CF8D] shadow-[0_0_8px_rgba(25,207,141,0.5)]" /></div>
                </div>
                <div className="mt-5 pt-5 border-t border-[#2A3B56] flex gap-2">
                  <button onClick={() => { setEditUser(u); setShowForm(true) }} className="flex-1 py-3 rounded-xl border border-[#2A3B56] text-[9px] font-black text-[#8CA3E6] uppercase tracking-widest hover:bg-[#24324A] transition-all flex items-center justify-center gap-2">Editar</button>
                  <button onClick={() => setDeleteUserId(u.id_usuario)} className="w-12 py-3 rounded-xl border border-[#2A3B56] text-[#EF4444] hover:bg-[#EF4444]/10 transition-all flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <ConfirmModal isOpen={deleteUserId !== null} title="¿Borrar?" message="Acción irreversible." onConfirm={async () => { if (deleteUserId !== null) { await api.delete(`/auth/usuarios/${deleteUserId}/`); setDeleteUserId(null); load() } }} onCancel={() => setDeleteUserId(null)} />
    </div>
  )
}
