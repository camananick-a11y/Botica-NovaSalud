import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Phone, Mail, MapPin, X, Users as UsersIcon, CreditCard, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import { ConfirmModal } from './ConfirmModal'

function initials(name: string) { return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }

const AVATAR_GRADIENTS = [
  'from-[#4EA0FC] to-[#3B82F6]', 'from-[#19CF8D] to-[#15B87C]', 'from-[#8CA3E6] to-[#6E8FCF]',
  'from-[#6E8FCF] to-[#5F7FB8]', 'from-[#7A96D6] to-[#5F7FB8]', 'from-[#4EA0FC] to-[#8CA3E6]'
]

function CustomerCard({ c, onSelect }: { c: any; onSelect: (c: any) => void }) {
  const grad = AVATAR_GRADIENTS[(c.id_cliente || c.id) % AVATAR_GRADIENTS.length]
  return (
    <div onClick={() => onSelect(c)} className="med-card-dark p-5 cursor-pointer hover:-translate-y-1 transition-all flex flex-col">
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-12 h-12 rounded-[18px] bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-black text-xs">{initials(c.nombre)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-[#E8F0FE] text-[13px] leading-tight mb-1">{c.nombre}</h4>
          <div className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-[#5F7FB8]" /><span className="text-[10px] text-[#8CA3E6] font-bold">{c.tipo_documento}: {c.numero_documento}</span></div>
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-[#2A3B56]">
        {[ { icon: Phone, text: c.telefono }, { icon: Mail, text: c.correo } ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-[#8CA3E6]"><item.icon className="w-3.5 h-3.5 text-[#5F7FB8]" /><span className="truncate">{item.text || '-'}</span></div>
        ))}
      </div>
    </div>
  )
}

function DetailModal({ c, onClose, onUpdate }: { c: any; onClose: () => void; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmSave, setShowConfirmSave] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(c)

  useEffect(() => { if (c) setForm(c) }, [c])
  if (!c) return null
  const grad = AVATAR_GRADIENTS[(c.id_cliente || c.id) % AVATAR_GRADIENTS.length]

  async function handleSave() {
    setSaving(true)
    try {
      await api.put(`/clientes/${c.id_cliente}/`, form)
      onUpdate(); setIsEditing(false)
    } catch (err) { alert('Error') } finally { setSaving(false) }
  }

  return (
    <>
      <div className="med-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="med-modal max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className={`bg-gradient-to-br ${grad} p-8 text-center relative`}>
            <div className="w-16 h-16 rounded-[22px] bg-white/20 flex items-center justify-center mx-auto mb-4 border border-white/20">
              <span className="text-white font-black text-2xl">{initials(c.nombre)}</span>
            </div>
            <h3 className="text-white font-black text-xl tracking-tighter mb-1">{c.nombre}</h3>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{c.tipo_documento}: {c.numero_documento}</p>
            <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-8 space-y-5">
            {isEditing ? (
              <div className="space-y-4">
                {[ { label: 'Teléfono', key: 'telefono' }, { label: 'Correo', key: 'correo' }, { label: 'Dirección', key: 'direccion' } ].map(f => (
                  <div key={f.key}><label className="med-label">{f.label}</label><input value={form[f.key] || ''} onChange={e => setForm({...form, [f.key]: e.target.value})} className="med-input" /></div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className="med-btn-secondary flex-1 text-[10px] uppercase tracking-widest">Cerrar</button>
                  <button onClick={() => setShowConfirmSave(true)} disabled={saving} className="med-btn-primary flex-[2] text-[10px] uppercase tracking-widest">{saving ? '...' : 'Confirmar'}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {[ { label: 'Contacto Directo', val: c.telefono || '-', icon: Phone }, { label: 'Correo Electrónico', val: c.correo || '-', icon: Mail }, { label: 'Domicilio', val: c.direccion || '-', icon: MapPin } ].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 bg-[#24324A] p-3 rounded-2xl">
                      <div className="w-9 h-9 rounded-xl bg-[#2A3B56] flex items-center justify-center text-[#8CA3E6]"><f.icon className="w-4 h-4" /></div>
                      <div><p className="med-section-title mb-1">{f.label}</p><p className="text-xs font-black text-[#E8F0FE]">{f.val}</p></div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4 border-t border-[#2A3B56]">
                  <button onClick={() => setIsEditing(true)} className="flex-1 py-3 rounded-xl border border-[#2A3B56] font-black text-[10px] text-[#19CF8D] hover:bg-[#19CF8D]/10 transition-all flex items-center justify-center gap-2">Editar</button>
                  <button onClick={() => setShowConfirmDelete(true)} className="flex-1 py-3 rounded-xl border border-[#2A3B56] font-black text-[10px] text-[#EF4444] hover:bg-[#EF4444]/10 transition-all flex items-center justify-center gap-2">Borrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={showConfirmDelete} title="¿Borrar?" message="Acción irreversible." onConfirm={async () => { await api.delete(`/clientes/${c.id_cliente}/`); onUpdate(); onClose() }} onCancel={() => setShowConfirmDelete(false)} />
      <ConfirmModal isOpen={showConfirmSave} title="Guardar Cambios" message="¿Confirmar los cambios realizados?" onConfirm={() => { handleSave(); setShowConfirmSave(false) }} onCancel={() => setShowConfirmSave(false)} type="warning" />
    </>
  )
}

function AddClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', tipo_documento: 'DNI', numero_documento: '', telefono: '', correo: '', direccion: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/clientes/', form)
      onSuccess()
    } catch { alert('Error al crear cliente') } finally { setSaving(false) }
  }

  return (
    <div className="med-modal-overlay" style={{ zIndex: 100 }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="med-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#2A3B56] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#E8F0FE]">Nuevo Cliente</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-[#2A3B56] text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] transition-all flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <div className="space-y-3">
            <p className="med-section-title">Información del Cliente</p>
            <div>
              <label className="med-label">Nombre Completo</label>
              <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="med-input" placeholder="Ej: Juan Pérez" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="med-section-title">Documento</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="med-label">Tipo</label>
                <select value={form.tipo_documento} onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}
                  className="med-select">
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>
              <div>
                <label className="med-label">N° Documento</label>
                <input required value={form.numero_documento} onChange={(e) => setForm({ ...form, numero_documento: e.target.value })}
                  className="med-input" placeholder="12345678" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="med-section-title">Contacto</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="med-label">Teléfono</label>
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="med-input" placeholder="987654321" />
              </div>
              <div>
                <label className="med-label">Correo</label>
                <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  className="med-input" placeholder="cliente@ejemplo.com" />
              </div>
            </div>
            <div>
              <label className="med-label">Dirección</label>
              <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="med-input" placeholder="Av. Siempre Viva 123" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="med-btn-secondary flex-1 text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="med-btn-primary flex-[2] text-sm">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : <><Plus className="w-4 h-4" /> Confirmar Registro</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Customers() {
  const [clientes, setClientes] = useState<any[]>([]); const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  const load = async () => { const { data } = await api.get('/clientes/'); setClientes(data.results || data) }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => clientes.filter((c) => !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || (c.numero_documento || '').includes(search.toLowerCase())), [search, clientes])

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden text-[#E8F0FE]">
      <div className="p-8 flex-shrink-0">
        <div className="flex items-start justify-between mb-8">
          <div><h1 className="text-2xl font-black text-[#E8F0FE] tracking-tighter">Clientes</h1><span className="text-[10px] font-black px-3 py-1 med-card-dark text-[#8CA3E6] rounded-lg uppercase tracking-widest inline-block mt-2">{clientes.length} Registros</span></div>
          <button onClick={() => setShowForm(true)} className="med-btn-primary text-[10px] uppercase tracking-widest"><Plus className="w-4 h-4" /> Nuevo Cliente</button>
        </div>

        {showForm && <AddClientModal onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); load() }} />}

        <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7FB8]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Identificar por nombre o documento..." className="med-input pl-12" /></div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-thin">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filtered.map((c) => <CustomerCard key={c.id_cliente} c={c} onSelect={setSelected} />)}
        </div>
        {filtered.length === 0 && <div className="text-center py-20 bg-[#24324A]/40 rounded-3xl border-2 border-dashed border-[#2A3B56] flex flex-col items-center"><UsersIcon className="w-16 h-16 text-[#5F7FB8] mb-4" /><p className="text-[#8CA3E6] font-black text-sm uppercase tracking-widest">No se encontraron registros</p></div>}
      </div>

      <DetailModal c={selected} onClose={() => setSelected(null)} onUpdate={load} />
    </div>
  )
}
