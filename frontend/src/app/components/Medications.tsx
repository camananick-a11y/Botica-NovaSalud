import { useState, useEffect, useMemo } from 'react'
import { Search, X, Plus, Package2, AlertTriangle, Pill, Camera, Loader2, Save, Edit3, Trash2, Image as ImageIcon, TrendingUp, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import { supabase } from '../../api/supabase'
import { ConfirmModal } from './ConfirmModal'

function BadgeCategory({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#4EA0FC]/20 text-[#E8F0FE] text-[9px] font-semibold uppercase tracking-wider border border-[#4EA0FC]/30">
      <Pill className="w-2.5 h-2.5" />
      {category}
    </span>
  )
}

function BadgeStock({ stock, threshold = 10 }: { stock: number, threshold?: number }) {
  const isLow = stock > 0 && stock <= threshold
  const isOut = stock === 0
  if (isOut) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EF4444]/15 text-[#EF4444] text-[9px] font-semibold uppercase tracking-wider border border-[#EF4444]/25"><AlertCircle className="w-2.5 h-2.5" /> Agotado</span>
  }
  if (isLow) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#6E8FCF]/15 text-[#6E8FCF] text-[9px] font-semibold uppercase tracking-wider border border-[#6E8FCF]/25"><AlertTriangle className="w-2.5 h-2.5" /> Stock Bajo</span>
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#19CF8D]/15 text-[#19CF8D] text-[9px] font-semibold uppercase tracking-wider border border-[#19CF8D]/25"><TrendingUp className="w-2.5 h-2.5" /> Disponible</span>
}

function BadgeLaboratory({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#4EA0FC]/20 text-[#E8F0FE] text-[9px] font-medium border border-[#4EA0FC]/30">
      <span className="w-2 h-2 rounded-full bg-[#4EA0FC]" />
      {name}
    </span>
  )
}

const PAGE_SIZE = 5

function PaginatedSelect({ label, value, onChange, items, idField, onCreate }: {
  label: string; value: string; onChange: (v: string) => void; items: any[]; idField: string; onCreate?: (name: string) => Promise<any>
}) {
  const [page, setPage] = useState(0)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const start = safePage * PAGE_SIZE
  const visibleItems = items.slice(start, start + PAGE_SIZE)

  async function handleCreate() {
    if (!newName.trim() || !onCreate) return
    const newItem = await onCreate(newName.trim())
    onChange(String(newItem[Object.keys(newItem)[0]]))
    setCreating(false)
    setNewName('')
    setPage(Math.max(0, Math.floor(items.length / PAGE_SIZE)))
  }

  if (creating) {
    return (
      <div>
        <label className="med-label">{label}</label>
        <div className="flex gap-2">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="med-input flex-1" placeholder={`Nuevo ${label.toLowerCase()}`} />
          <button type="button" onClick={handleCreate}
            className="px-3 py-2 rounded-lg bg-[#19CF8D] text-[#162033] text-xs font-bold hover:bg-[#15B87C] transition-all">OK</button>
          <button type="button" onClick={() => { setCreating(false); setNewName('') }}
            className="px-3 py-2 rounded-lg border border-[#2A3B56] text-[#8CA3E6] text-xs font-bold hover:bg-[#24324A] transition-all">X</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="med-label">{label}</label>
        {onCreate && (
          <button type="button" onClick={() => setCreating(true)}
            className="text-[9px] font-bold text-[#4EA0FC] hover:text-[#B5CEFF] transition-colors uppercase tracking-wider">+ Nueva</button>
        )}
      </div>
      <div className="med-select !p-0 !overflow-hidden">
        {visibleItems.length === 0 && (
          <div className="px-4 py-3 text-sm text-[#8CA3E6] text-center">Sin opciones</div>
        )}
        {visibleItems.map((item) => {
          const itemValue = String(item[idField])
          const isSelected = String(value) === itemValue
          return (
            <button
              key={itemValue}
              type="button"
              onClick={() => { onChange(itemValue); setPage(0) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all border-b border-[#2A3B56]/50 last:border-b-0 ${
                isSelected
                  ? 'bg-[#4EA0FC]/15 text-[#E8F0FE] font-semibold border-l-2 border-l-[#4EA0FC]'
                  : 'text-[#B5CEFF] hover:bg-[#2A3B56]'
              }`}
            >
              {item.nombre}
            </button>
          )
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-1.5 px-1">
          <button type="button" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
            className="text-[#8CA3E6] hover:text-[#E8F0FE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0.5">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-medium text-[#5F7FB8]">{safePage + 1} / {totalPages}</span>
          <button type="button" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1}
            className="text-[#8CA3E6] hover:text-[#E8F0FE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0.5">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

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

  if (!isEditing) {
    return (
      <>
        <div className="med-modal-overlay" style={{ zIndex: 100 }}>
          <div className="absolute inset-0" onClick={onClose} />
          <div className="med-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 rounded-lg bg-[#24324A] border border-[#2A3B56] text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#2A3B56] transition-all flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>

            <div className="h-48 bg-gradient-to-b from-[#24324A] to-[#1B263B] flex items-center justify-center border-b border-[#2A3B56] overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt={med.nombre} className="w-full h-full object-contain p-6" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#5F7FB8]">
                  <Pill className="w-14 h-14" />
                  <span className="text-xs font-medium">Sin imagen</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#E8F0FE] tracking-tight">{med.nombre}</h2>
                <div className="flex items-center gap-2">
                  <BadgeLaboratory name={med.laboratorio_nombre || '-'} />
                </div>
                <p className="text-3xl font-bold text-[#19CF8D]">S/ {Number(med.precio).toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#24324A] rounded-xl p-4 border border-[#2A3B56]">
                  <p className="text-[9px] font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1">Presentación</p>
                  <p className="text-sm font-semibold text-[#E8F0FE]">{med.presentacion_nombre || '-'}</p>
                </div>
                <div className="bg-[#24324A] rounded-xl p-4 border border-[#2A3B56]">
                  <p className="text-[9px] font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1">Categoría</p>
                  <p className="text-sm font-semibold text-[#E8F0FE]">{med.categoria_nombre || '-'}</p>
                </div>
                <div className="bg-[#24324A] rounded-xl p-4 border border-[#2A3B56]">
                  <p className="text-[9px] font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1">Unidad</p>
                  <p className="text-sm font-semibold text-[#E8F0FE]">{med.unidad_nombre || '-'}</p>
                </div>
                <div className="bg-[#24324A] rounded-xl p-4 border border-[#2A3B56]">
                  <p className="text-[9px] font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1">Laboratorio</p>
                  <p className="text-sm font-semibold text-[#E8F0FE]">{med.laboratorio_nombre || '-'}</p>
                </div>
              </div>

              <div className="bg-[#24324A] rounded-xl p-4 border border-[#2A3B56] flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1">Stock Disponible</p>
                  <p className="text-xl font-bold text-[#E8F0FE]">{med.stock ?? 0} {med.unidad_nombre || 'uds'}</p>
                </div>
                <BadgeStock stock={med.stock ?? 0} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#2A3B56] bg-[#162033] flex gap-3">
              <button onClick={() => setIsEditing(true)} className="med-btn-primary flex-1 text-sm">
                <Edit3 className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setShowConfirmDelete(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 font-medium text-sm transition-all active:scale-[0.98]">
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        </div>
        {showConfirmDelete && <ConfirmModal title="Eliminar Medicamento" message={`¿Confirmar eliminación de "${med.nombre}"?`} onConfirm={async () => { await api.delete(`/medicamentos/${med.id_medicamento}/`); onUpdate(); onClose() }} onCancel={() => setShowConfirmDelete(false)} />}
      </>
    )
  }

  return (
    <>
      <div className="med-modal-overlay" style={{ zIndex: 100 }}>
        <div className="absolute inset-0" onClick={() => { setIsEditing(false); setPreviewUrl(med.imagen_url); setSelectedFile(null) }} />
        <div className="med-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-[#2A3B56] flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#E8F0FE]">Editar Medicamento</h3>
            <button onClick={() => { setIsEditing(false); setPreviewUrl(med.imagen_url); setSelectedFile(null) }} className="w-8 h-8 rounded-lg border border-[#2A3B56] text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] transition-all flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
            <div className="space-y-2">
              <label className="med-label">Imagen del Medicamento</label>
              <div className="relative h-36 bg-[#24324A] rounded-xl border-2 border-dashed border-[#2A3B56] flex flex-col items-center justify-center group overflow-hidden hover:border-[#4EA0FC]/50 transition-all">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-[#162033]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <span className="med-btn-primary text-xs px-3 py-1.5"><Camera className="w-3.5 h-3.5" /> Cambiar</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera className="w-7 h-7 text-[#5F7FB8] mx-auto mb-1.5" />
                    <span className="text-xs font-medium text-[#8CA3E6]">Selecciona una imagen</span>
                  </div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)) }}} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="med-section-title">Información Básica</p>
              <div>
                <label className="med-label">Nombre del Medicamento</label>
                <input value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                  className="med-input" placeholder="Ej: Ibuprofeno 400mg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="med-label">Precio (S/)</label>
                  <input type="number" step="0.01" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})}
                    className="med-input" placeholder="0.00" />
                </div>
                <div>
                  <label className="med-label">Stock</label>
                  <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                    className="med-input" placeholder="0" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="med-section-title">Clasificación</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                <PaginatedSelect label="Laboratorio" items={labs} value={editForm.id_laboratorio}
                  onChange={v => setEditForm({...editForm, id_laboratorio: v})} idField="id_laboratorio"
                  onCreate={async name => { const { data } = await api.post('/medicamentos/laboratorios/', { nombre: name }); setLabs(p => [...p, data]); return data }} />
                <PaginatedSelect label="Categoría" items={cats} value={editForm.id_categoria}
                  onChange={v => setEditForm({...editForm, id_categoria: v})} idField="id_categoria"
                  onCreate={async name => { const { data } = await api.post('/medicamentos/categorias/', { nombre: name }); setCats(p => [...p, data]); return data }} />
                <PaginatedSelect label="Presentación" items={pres} value={editForm.id_presentacion}
                  onChange={v => setEditForm({...editForm, id_presentacion: v})} idField="id_presentacion"
                  onCreate={async name => { const { data } = await api.post('/medicamentos/presentaciones/', { nombre: name }); setPres(p => [...p, data]); return data }} />
                <PaginatedSelect label="Unidad" items={units} value={editForm.id_unidad}
                  onChange={v => setEditForm({...editForm, id_unidad: v})} idField="id_unidad"
                  onCreate={async name => { const { data } = await api.post('/medicamentos/unidades/', { nombre: name }); setUnits(p => [...p, data]); return data }} />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#2A3B56] bg-[#162033] flex gap-3">
            <button onClick={() => { setIsEditing(false); setPreviewUrl(med.imagen_url); setSelectedFile(null) }}
              className="med-btn-secondary flex-1 text-sm">
              Cancelar
            </button>
            <button onClick={() => setShowConfirmSave(true)} disabled={loading}
              className="med-btn-primary flex-[2] text-sm">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
            </button>
          </div>
        </div>
      </div>
      {showConfirmSave && <ConfirmModal title="Guardar Cambios" message="¿Confirmar los cambios en este medicamento?" onConfirm={handleSaveProcess} onCancel={() => setShowConfirmSave(false)} type="warning" />}
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
    <div className="med-modal-overlay" style={{ zIndex: 100 }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="med-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#2A3B56] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#E8F0FE]">Nuevo Medicamento</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-[#2A3B56] text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] transition-all flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <div className="space-y-2">
            <label className="med-label">Imagen del Medicamento</label>
            <div className="relative h-36 bg-[#24324A] rounded-xl border-2 border-dashed border-[#2A3B56] flex flex-col items-center justify-center group overflow-hidden hover:border-[#4EA0FC]/50 transition-all">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-[#162033]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="med-btn-primary text-xs px-3 py-1.5"><Camera className="w-3.5 h-3.5" /> Cambiar</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-7 h-7 text-[#5F7FB8] mx-auto mb-1.5" />
                  <span className="text-xs font-medium text-[#8CA3E6]">Selecciona una imagen</span>
                </div>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)) }}} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="med-section-title">Información Básica</p>
            <div>
              <label className="med-label">Nombre del Medicamento</label>
              <input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="med-input" placeholder="Ej: Ibuprofeno 400mg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="med-label">Precio (S/)</label>
                <input required type="number" step="0.01" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})}
                  className="med-input" placeholder="0.00" />
              </div>
              <div>
                <label className="med-label">Stock Inicial</label>
                <input required type="number" value={formData.cantidad_inicial} onChange={e => setFormData({...formData, cantidad_inicial: e.target.value})}
                  className="med-input" placeholder="0" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="med-section-title">Clasificación</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <PaginatedSelect label="Laboratorio" items={labs} value={formData.id_laboratorio}
                onChange={v => setFormData({...formData, id_laboratorio: v})} idField="id_laboratorio"
                onCreate={async name => { const { data } = await api.post('/medicamentos/laboratorios/', { nombre: name }); setLabs(p => [...p, data]); return data }} />
              <PaginatedSelect label="Categoría" items={cats} value={formData.id_categoria}
                onChange={v => setFormData({...formData, id_categoria: v})} idField="id_categoria"
                onCreate={async name => { const { data } = await api.post('/medicamentos/categorias/', { nombre: name }); setCats(p => [...p, data]); return data }} />
              <PaginatedSelect label="Presentación" items={pres} value={formData.id_presentacion}
                onChange={v => setFormData({...formData, id_presentacion: v})} idField="id_presentacion"
                onCreate={async name => { const { data } = await api.post('/medicamentos/presentaciones/', { nombre: name }); setPres(p => [...p, data]); return data }} />
              <PaginatedSelect label="Unidad" items={units} value={formData.id_unidad}
                onChange={v => setFormData({...formData, id_unidad: v})} idField="id_unidad"
                onCreate={async name => { const { data } = await api.post('/medicamentos/unidades/', { nombre: name }); setUnits(p => [...p, data]); return data }} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="med-btn-secondary flex-1 text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="med-btn-primary flex-[2] text-sm">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : <><Plus className="w-4 h-4" /> Crear Medicamento</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Medications() {
  const [medicamentos, setMedicamentos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [stockFilter, setStockFilter] = useState<'todos' | 'bajo' | 'disponible'>('todos')

  const fetchMedicamentos = () => { setLoading(true); api.get('/medicamentos/?all=true').then(({ data }) => { setMedicamentos(data.results || data) }).finally(() => setLoading(false)) }
  useEffect(() => { fetchMedicamentos() }, [])

  const filtered = useMemo(() => {
    let result = medicamentos.filter((m) => !search || m.nombre.toLowerCase().includes(search.toLowerCase()) || (m.laboratorio_nombre || '').toLowerCase().includes(search.toLowerCase()))
    if (categoryFilter) result = result.filter(m => m.categoria_nombre === categoryFilter)
    if (stockFilter === 'bajo') result = result.filter(m => (m.stock ?? 0) <= 10)
    if (stockFilter === 'disponible') result = result.filter(m => (m.stock ?? 0) > 10)
    return result
  }, [search, medicamentos, stockFilter, categoryFilter])

  const selectedMed = useMemo(() => medicamentos.find(m => m.id_medicamento === selectedId), [selectedId, medicamentos])
  const categories = useMemo(() => [...new Set(medicamentos.map(m => m.categoria_nombre).filter(Boolean))], [medicamentos])

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="px-6 sm:px-8 pt-6 pb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4EA0FC]/10 border border-[#4EA0FC]/20 flex items-center justify-center">
              <Package2 className="w-5 h-5 text-[#4EA0FC]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#E8F0FE] tracking-tight">Inventario</h1>
              <p className="text-[10px] font-medium text-[#8CA3E6]">Gestión de medicamentos</p>
            </div>
          </div>
          <button onClick={() => setIsAdding(true)}
            className="med-btn-primary text-sm">
            <Plus className="w-4 h-4" />
            Nuevo Medicamento
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7FB8]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar medicamento, laboratorio..."
              className="med-input pl-9" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F7FB8] hover:text-[#E8F0FE] transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as any)}
            className="med-select !w-auto">
            <option value="todos">Todos</option>
            <option value="disponible">Stock Disponible</option>
            <option value="bajo">Stock Bajo</option>
          </select>

          {categories.length > 0 && (
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="med-select !w-auto">
              <option value="">Todas las categorías</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          )}

          <span className="text-xs font-medium text-[#5F7FB8] whitespace-nowrap">{filtered.length} de {medicamentos.length} productos</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 scrollbar-thin">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-7 h-7 text-[#4EA0FC] animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-[#8CA3E6]">Cargando medicamentos...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Pill className="w-12 h-12 text-[#5F7FB8] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#8CA3E6]">No hay medicamentos que coincidan</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-2">
            {filtered.map((med) => {
              const isLow = (med.stock ?? 0) > 0 && (med.stock ?? 0) <= 10
              const isOut = (med.stock ?? 0) === 0

              return (
                <button key={med.id_medicamento} onClick={() => setSelectedId(med.id_medicamento)}
                  className="med-card group text-left relative flex flex-col h-full overflow-hidden active:scale-[0.98]">

                  {isLow && (
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-[#6E8FCF]/90 text-white rounded-md text-[9px] font-semibold shadow-md">
                      <AlertTriangle className="w-3 h-3" /> Stock Bajo
                    </div>
                  )}
                  {isOut && (
                    <div className="absolute inset-0 z-10 bg-[#081C40]/85 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                      <div className="text-center">
                        <AlertCircle className="w-7 h-7 text-[#EF4444] mx-auto mb-1" />
                        <span className="text-[10px] font-semibold text-[#EF4444] uppercase tracking-wider">Agotado</span>
                      </div>
                    </div>
                  )}

                  <div className="h-40 flex items-center justify-center bg-gradient-to-b from-[#12305A] to-[#081C40] p-4 border-b border-[#12305A]">
                    {med.imagen_url ? (
                      <img src={med.imagen_url} alt={med.nombre} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Pill className="w-12 h-12 text-[#B5CEFF]" />
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div>
                      <h4 className="font-semibold text-[#E8F0FE] text-sm leading-snug line-clamp-2 group-hover:text-[#B5CEFF] transition-colors">{med.nombre}</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      <BadgeLaboratory name={med.laboratorio_nombre || '-'} />
                      <BadgeCategory category={med.categoria_nombre || '-'} />
                    </div>

                    <div className="mt-auto pt-2.5 border-t border-[#12305A] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-[#B5CEFF]">Precio</span>
                        <span className="text-base font-bold text-[#19CF8D]">S/ {Number(med.precio).toFixed(2)}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${
                        isOut ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25' : isLow ? 'bg-[#6E8FCF]/15 text-[#B5CEFF] border border-[#6E8FCF]/25' : 'bg-[#19CF8D]/15 text-[#19CF8D] border border-[#19CF8D]/25'
                      }`}>
                        {isOut ? <AlertCircle className="w-3.5 h-3.5" /> : isLow ? <AlertTriangle className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        <span>{med.stock ?? 0} {med.unidad_nombre || 'en stock'}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <MedModal med={selectedMed} onClose={() => setSelectedId(null)} onUpdate={fetchMedicamentos} />
      {isAdding && <AddMedModal onClose={() => setIsAdding(false)} onSuccess={() => { setIsAdding(false); fetchMedicamentos() }} />}
    </div>
  )
}
