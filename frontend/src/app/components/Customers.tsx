import { useState, useEffect, useMemo, FormEvent } from 'react'
import { Search, Plus, Phone, Mail, MapPin, X, Users as UsersIcon, User, Hash, Home, Calendar, Edit3, Trash2, Save, Loader2, CreditCard } from 'lucide-react'
import api from '../../api/axios'
import { ConfirmModal } from './ConfirmModal'

function initials(name: string) { return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }

const AVATAR_GRADIENTS = [
  'from-emerald-500 to-emerald-700', 'from-blue-500 to-blue-700', 'from-violet-500 to-violet-700',
  'from-amber-500 to-amber-700', 'from-rose-500 to-rose-700', 'from-cyan-500 to-cyan-700'
]

function CustomerCard({ c, onSelect }: { c: any; onSelect: (c: any) => void }) {
  const grad = AVATAR_GRADIENTS[(c.id_cliente || c.id) % AVATAR_GRADIENTS.length]
  return (
    <div onClick={() => onSelect(c)} className="bg-white rounded-[32px] border-2 border-white shadow-xl shadow-slate-200/50 p-5 hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-100 transition-all group cursor-pointer flex flex-col">
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-12 h-12 rounded-[18px] bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-900/10`}>
          <span className="text-white font-black text-xs">{initials(c.nombre)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-slate-900 text-[13px] leading-tight mb-1">{c.nombre}</h4>
          <div className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-slate-300" /><span className="text-[10px] text-slate-400 font-bold">{c.tipo_documento}: {c.numero_documento}</span></div>
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-slate-50">
        {[ { icon: Phone, text: c.telefono }, { icon: Mail, text: c.correo } ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-500"><item.icon className="w-3.5 h-3.5 text-slate-200" /><span className="truncate">{item.text || '-'}</span></div>
        ))}
      </div>
    </div>
  )
}

function DetailModal({ c, onClose, onUpdate }: { c: any; onClose: () => void; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative bg-white rounded-[40px] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-300 border border-slate-100" onClick={(e) => e.stopPropagation()}>
          <div className={`bg-gradient-to-br ${grad} p-8 text-center relative`}>
            <div className="w-16 h-16 rounded-[22px] bg-white/20 flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl"><span className="text-white font-black text-2xl">{initials(c.nombre)}</span></div>
            <h3 className="text-white font-black text-xl tracking-tighter mb-1">{c.nombre}</h3>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{c.tipo_documento}: {c.numero_documento}</p>
            <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-8 space-y-5">
            {isEditing ? (
              <div className="space-y-4">
                {[ { label: 'Teléfono', key: 'telefono' }, { label: 'Correo', key: 'correo' }, { label: 'Dirección', key: 'direccion' } ].map(f => (
                  <div key={f.key}><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{f.label}</label><input value={form[f.key] || ''} onChange={e => setForm({...form, [f.key]: e.target.value})} className="w-full px-4 py-3 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-100 outline-none transition-all" /></div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cerrar</button>
                  <button onClick={handleSave} disabled={saving} className="flex-[2] py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar'}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {[ { label: 'Contacto Directo', val: c.telefono || '-', icon: Phone }, { label: 'Correo Electrónico', val: c.correo || '-', icon: Mail }, { label: 'Domicilio', val: c.direccion || '-', icon: MapPin } ].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-[20px] border border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-300 shadow-sm"><f.icon className="w-4 h-4" /></div>
                      <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{f.label}</p><p className="text-xs font-black text-slate-900">{f.val}</p></div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <button onClick={() => setIsEditing(true)} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 font-black text-[10px] text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">Editar</button>
                  <button onClick={() => setShowConfirmDelete(true)} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 font-black text-[10px] text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2">Borrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showConfirmDelete && <ConfirmModal title="¿Borrar?" message="Acción irreversible." onConfirm={async () => { await api.delete(`/clientes/${c.id_cliente}/`); onUpdate(); onClose() }} onCancel={() => setShowConfirmDelete(false)} />}
    </>
  )
}

export function Customers() {
  const [clientes, setClientes] = useState<any[]>([]); const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ nombre: '', tipo_documento: 'DNI', numero_documento: '', telefono: '', correo: '', direccion: '' })
  const [selected, setSelected] = useState<any>(null)

  const load = async () => { const { data } = await api.get('/clientes/'); setClientes(data.results || data) }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => clientes.filter((c) => !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || (c.numero_documento || '').includes(search.toLowerCase())), [search, clientes])

  async function addCustomer(e: FormEvent) {
    e.preventDefault(); await api.post('/clientes/', form); setForm({ nombre: '', tipo_documento: 'DNI', numero_documento: '', telefono: '', correo: '', direccion: '' }); setShowForm(false); load()
  }

  return (
    <div className="h-full flex flex-col bg-slate-100/60 overflow-hidden text-slate-900" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <div className="p-8 flex-shrink-0">
        <div className="flex items-start justify-between mb-8">
          <div><h1 className="text-2xl font-black text-slate-900 tracking-tighter">Clientes</h1><span className="text-[10px] font-black px-3 py-1 bg-white border border-slate-200 text-slate-400 rounded-lg uppercase tracking-widest shadow-sm">{clientes.length} Registros</span></div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-xl shadow-slate-200"><Plus className="w-4 h-4" /> Nuevo Cliente</button>
        </div>

        {showForm && (
          <form onSubmit={addCustomer} className="bg-white rounded-[40px] border-2 border-white shadow-2xl p-8 mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-8"><h3 className="font-black text-slate-900 text-lg tracking-tighter">Registro de Cliente</h3><button type="button" onClick={() => setShowForm(false)} className="text-slate-300 hover:text-slate-900 transition-all"><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2"><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label><input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-emerald-100 outline-none text-xs font-bold" /></div>
              <div><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Documento</label><select value={form.tipo_documento} onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-xs font-bold appearance-none"><option value="DNI">DNI</option><option value="RUC">RUC</option></select></div>
              <div><label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">N° Documento</label><input required value={form.numero_documento} onChange={(e) => setForm({ ...form, numero_documento: e.target.value })} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-xs font-bold" /></div>
            </div>
            <div className="flex gap-4 mt-8"><button type="submit" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10 active:scale-95 transition-all">Confirmar Registro</button><button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 border-2 border-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button></div>
          </form>
        )}

        <div className="relative group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-all" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Identificar por nombre o documento..." className="w-full pl-16 pr-8 py-4 rounded-2xl border-2 border-white bg-white/60 focus:bg-white focus:border-emerald-500/20 outline-none text-sm font-bold shadow-sm transition-all" /></div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((c) => <CustomerCard key={c.id_cliente} c={c} onSelect={setSelected} />)}
        </div>
        {filtered.length === 0 && <div className="text-center py-20 bg-white/40 rounded-[48px] border-2 border-dashed border-white flex flex-col items-center"><UsersIcon className="w-16 h-16 text-slate-200 mb-4" /><p className="text-slate-400 font-black text-sm uppercase tracking-widest">No se encontraron registros</p></div>}
      </div>

      <DetailModal c={selected} onClose={() => setSelected(null)} onUpdate={load} />
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  )
}
