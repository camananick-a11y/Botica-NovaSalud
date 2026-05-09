import { useState, useEffect, useMemo, type ElementType } from 'react'
import { Search, X, Plus, Package2, AlertTriangle, Pill, Syringe, Droplets, Heart, Filter, ChevronDown, Camera, Loader2, Save, Edit3, Trash2, Image as ImageIcon, ChevronRight, ChevronLeft, BarChart3 } from 'lucide-react'
import api from '../../api/axios'
import { supabase } from '../../api/supabase'
import { ConfirmModal } from './ConfirmModal'

interface MedModalProps {
  med: any
  onClose: () => void
  onUpdate: () => void
}

function MedModal({ med, onClose, onUpdate }: MedModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmSave, setShowConfirmSave] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    nombre: '', precio: '', id_laboratorio: '', id_categoria: '', id_presentacion: '', id_unidad: '', stock: 0
  })

  const [labs, setLabs] = useState<any[]>([])
  const [cats, setCats] = useState<any[]>([])
  const [pres, setPres] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  useEffect(() => {
    if (med) {
      setEditForm({
        nombre: med.nombre, precio: med.precio.toString(), id_laboratorio: med.id_laboratorio.toString(),
        id_categoria: med.id_categoria.toString(), id_presentacion: med.id_presentacion.toString(),
        id_unidad: med.id_unidad.toString(), stock: med.stock || 0
      })
      setPreviewUrl(med.imagen_url || null)
    }
  }, [med])

  const fetchAuxData = async () => {
    try {
      const [l, c, p, u] = await Promise.all([api.get('/medicamentos/laboratorios/'), api.get('/medicamentos/categorias/'), api.get('/medicamentos/presentaciones/'), api.get('/medicamentos/unidades/')])
      setLabs(l.data); setCats(c.data); setPres(p.data); setUnits(u.data)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { if (isEditing) fetchAuxData() }, [isEditing])

  if (!med) return null

  const handleSaveProcess = async () => {
    setLoading(true); setShowConfirmSave(false)
    try {
      let finalImageUrl = med.imagen_url
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`
        const { error } = await supabase.storage.from('images').upload(fileName, selectedFile)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
        finalImageUrl = publicUrl
      }
      await api.put(`/medicamentos/${med.id_medicamento}/`, { ...editForm, precio: parseFloat(editForm.precio), stock: editForm.stock, imagen_url: finalImageUrl })
      onUpdate(); setIsEditing(false); setSelectedFile(null)
    } catch (err: any) { alert('Error: ' + err.message) } finally { setLoading(false) }
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative bg-slate-900 rounded-[32px] shadow-2xl max-w-sm w-full flex flex-col overflow-hidden animate-in zoom-in duration-500 border border-slate-800" onClick={(e) => e.stopPropagation()}>
          <div className="h-40 flex-shrink-0 relative bg-slate-950 flex items-center justify-center border-b border-slate-800">
            {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-6" /> : <ImageIcon className="w-10 h-10 text-slate-800" />}
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group">
                <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-2xl transition-all hover:scale-105"><Camera className="w-4 h-4" /> Cambiar</div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f){ setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)) }}} />
              </label>
            )}
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all z-20"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="col-span-2"><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Nombre</label><input value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:border-emerald-500 outline-none transition-all text-xs font-bold" /></div>
                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Precio</label><input type="number" step="0.01" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-bold" /></div>
                <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Stock</label><input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-bold" /></div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-between items-start"><div><h3 className="font-black text-white text-xl tracking-tighter leading-none mb-1 truncate">{med.nombre}</h3><p className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">{med.laboratorio_nombre}</p></div><div className="text-right"><p className="text-xl font-black text-emerald-400 tracking-tighter leading-none">S/ {med.precio}</p></div></div>
                <div className="grid grid-cols-2 gap-3">
                  {[ { label: 'Presentación', value: med.presentacion_nombre || '-', icon: Package2 }, { label: 'Categoría', value: med.categoria_nombre || '-', icon: Filter } ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-slate-950 rounded-2xl p-3 border border-slate-800"><div className="flex items-center gap-2 mb-1.5 text-emerald-500/50"><Icon className="w-3 h-3" /><span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{label}</span></div><p className="text-[10px] font-black text-slate-200">{value}</p></div>
                  ))}
                </div>
                <div className="bg-slate-950 rounded-2xl p-4 flex items-center justify-between border border-slate-800"><div className="z-10"><span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-0.5">Stock Disponible</span><p className="text-lg font-black tracking-tighter text-white">{med.stock ?? 0} {med.unidad_nombre || 'uds'}</p></div><BarChart3 className="w-5 h-5 text-emerald-500/20" /></div>
              </div>
            )}
          </div>

          <div className="p-6 pt-0 bg-slate-900">
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              {isEditing ? (
                <>
                  <button onClick={() => { setIsEditing(false); setPreviewUrl(med.imagen_url); setSelectedFile(null) }} className="flex-1 py-3 rounded-xl border border-slate-800 font-black text-[9px] text-slate-400 uppercase tracking-widest transition-all">Cancelar</button>
                  <button onClick={() => setShowConfirmSave(true)} disabled={loading} className="flex-[2] py-3 rounded-xl bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg">{loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar'}</button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="flex-1 py-3 rounded-xl border border-slate-800 font-black text-[10px] text-emerald-500 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"><Edit3 className="w-4 h-4" /> Editar</button>
                  <button onClick={() => setShowConfirmDelete(true)} className="flex-1 py-3 rounded-xl border border-slate-800 font-black text-[10px] text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Borrar</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showConfirmDelete && <ConfirmModal title="Eliminar" message="¿Confirmar acción?" onConfirm={async () => { await api.delete(`/medicamentos/${med.id_medicamento}/`); onUpdate(); onClose() }} onCancel={() => setShowConfirmDelete(false)} />}
      {showConfirmSave && <ConfirmModal title="Guardar" message="¿Confirmar cambios?" onConfirm={handleSaveProcess} onCancel={() => setShowConfirmSave(false)} type="warning" />}
    </>
  )
}

function AddMedModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [labs, setLabs] = useState<any[]>([]); const [cats, setCats] = useState<any[]>([]); const [pres, setPres] = useState<any[]>([]); const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null); const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', precio: '', id_laboratorio: '', id_categoria: '', id_presentacion: '', id_unidad: '', cantidad_inicial: '0' })

  useEffect(() => {
    Promise.all([api.get('/medicamentos/laboratorios/'), api.get('/medicamentos/categorias/'), api.get('/medicamentos/presentaciones/'), api.get('/medicamentos/unidades/')])
      .then(([l, c, p, u]) => { setLabs(l.data); setCats(c.data); setPres(p.data); setUnits(u.data) })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      let imageUrl = null
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`
        const { error } = await supabase.storage.from('images').upload(fileName, selectedFile)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
        imageUrl = publicUrl
      }
      await api.post('/medicamentos/', { ...formData, precio: parseFloat(formData.precio), cantidad_inicial: parseInt(formData.cantidad_inicial), imagen_url: imageUrl })
      onSuccess()
    } catch (err: any) { alert('Error') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-[32px] shadow-2xl max-w-md w-full flex flex-col overflow-hidden border border-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <h3 className="font-black text-white text-xl tracking-tighter">Nuevo Producto</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5 no-scrollbar bg-slate-900">
          <div className="relative h-32 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center group overflow-hidden">
            {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" /> : <ImageIcon className="w-6 h-6 text-slate-800" />}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f){ setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)) }}} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Nombre</label><input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-bold focus:border-emerald-500 outline-none transition-all" /></div>
            <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Precio</label><input required type="number" step="0.01" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-bold" /></div>
            <div><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Stock</label><input required type="number" value={formData.cantidad_inicial} onChange={e => setFormData({...formData, cantidad_inicial: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-bold" /></div>
            <div className="col-span-2"><label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Laboratorio</label><select required value={formData.id_laboratorio} onChange={e => setFormData({...formData, id_laboratorio: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-[10px] font-bold appearance-none cursor-pointer">{labs.map((item: any) => <option key={item.id_laboratorio} value={item.id_laboratorio}>{item.nombre}</option>)}</select></div>
          </div>
        </form>
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
          <button onClick={(e) => { e.preventDefault(); handleSubmit(e as any) }} className="flex-[2] py-3 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">Confirmar</button>
        </div>
      </div>
    </div>
  )
}

export function Medications() {
  const [medicamentos, setMedicamentos] = useState<any[]>([]); const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null); const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchMedicamentos = () => { setLoading(true); api.get('/medicamentos/').then(({ data }) => { setMedicamentos(data.results || data) }).finally(() => setLoading(false)) }
  useEffect(() => { fetchMedicamentos() }, [])

  const filtered = useMemo(() => medicamentos.filter((m) => !search || m.nombre.toLowerCase().includes(search.toLowerCase()) || (m.laboratorio_nombre || '').toLowerCase().includes(search.toLowerCase())), [search, medicamentos])
  const selectedMed = useMemo(() => medicamentos.find(m => m.id_medicamento === selectedId), [selectedId, medicamentos])

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden text-slate-100" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <div className="p-6 sm:p-8 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4"><h1 className="text-2xl font-black text-white tracking-tighter">Inventario</h1><span className="text-[9px] font-black px-3 py-1 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg uppercase tracking-widest">{medicamentos.length} Ítems</span></div>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg shadow-emerald-900/20"><Plus className="w-4 h-4" /> Nuevo</button>
        </div>
        <div className="relative group"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-all" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="¿Qué buscas?" className="w-full pl-12 pr-8 py-3 rounded-2xl border border-slate-800 bg-slate-900 text-white focus:bg-slate-800 focus:outline-none focus:border-emerald-500 text-xs font-bold transition-all shadow-inner" /></div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-10 no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filtered.map((med) => {
            const isLow = (med.stock ?? 0) <= 10
            return (
              <div key={med.id_medicamento} onClick={() => setSelectedId(med.id_medicamento)} 
                className="bg-slate-900 rounded-[28px] border border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-500/50 transition-all duration-500 group cursor-pointer flex flex-col shadow-sm">
                <div className="h-36 flex items-center justify-center relative bg-slate-950 m-2.5 rounded-[22px] shadow-inner p-8">
                  {isLow && <div className="absolute top-4 left-4 z-10 bg-red-500 text-white p-1 rounded-lg shadow-xl animate-pulse"><AlertTriangle className="w-3 h-3" /></div>}
                  {med.imagen_url ? <img src={med.imagen_url} alt={med.nombre} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" /> : <Pill className="w-8 h-8 text-slate-800" />}
                </div>
                <div className="px-5 pb-5 pt-2 flex-1 flex flex-col">
                  <h4 className="font-black text-white text-[10px] leading-tight mb-1 line-clamp-2 min-h-[2rem] tracking-tight">{med.nombre}</h4>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4 truncate">{med.laboratorio_nombre || '-'}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
                    <p className="text-sm font-black text-emerald-400 tracking-tighter">S/ {med.precio}</p>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${isLow ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                      <span className="text-[8px] font-black tracking-widest">{med.stock ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <MedModal med={selectedMed} onClose={() => setSelectedId(null)} onUpdate={fetchMedicamentos} />
      {isAdding && <AddMedModal onClose={() => setIsAdding(false)} onSuccess={() => { setIsAdding(false); fetchMedicamentos() }} />}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  )
}
