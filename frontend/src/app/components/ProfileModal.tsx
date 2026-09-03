import { useState, useRef } from 'react'
import { Camera, X, Save, Loader2, Edit3, User, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { supabase } from '../../api/supabase'
import { ConfirmModal } from './ConfirmModal'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useApp()
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmSave, setShowConfirmSave] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !user) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no debe superar 2MB')
      return
    }
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSave = async () => {
    setError('')
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (password && password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setSaving(true)
    try {
      let imagen_url = user.imagen_url
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `avatars/${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, selectedFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
        imagen_url = publicUrl
      }
      const body: Record<string, any> = { nombre: nombre.trim() }
      if (password) body.password = password
      body.imagen_url = imagen_url
      await updateProfile(body)
      toast.success('Perfil actualizado')
      setEditing(false)
      setPassword('')
      setConfirmPassword('')
      setSelectedFile(null)
      setPreview(null)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar perfil')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = () => {
    setNombre(user.name)
    setPassword('')
    setConfirmPassword('')
    setSelectedFile(null)
    setPreview(null)
    setError('')
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setPassword('')
    setConfirmPassword('')
    setSelectedFile(null)
    setPreview(null)
    setError('')
  }

  const avatarSrc = preview || user.imagen_url
  const username = user.email.split('@')[0]

  return (
    <div className="med-modal-overlay animate-in fade-in duration-200" style={{ zIndex: 300 }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="med-modal p-0 animate-in zoom-in-150 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ width: '500px' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A3B56]">
          <h3 className="text-base font-bold text-[#E8F0FE]">Ver Perfil</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8CA3E6] hover:text-[#E8F0FE] hover:bg-[#24324A] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {editing ? (
          <>
            <div className="px-6 py-5 space-y-5">
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#4EA0FC]/40 bg-[#24324A]">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#E8F0FE] bg-gradient-to-br from-[#4EA0FC] to-[#19CF8D]">
                        {user.avatar}
                      </div>
                    )}
                  </div>
                  <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#4EA0FC] hover:bg-[#3A8FDF] text-white flex items-center justify-center shadow-lg transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1.5">Nombre</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1B263B] border border-[#2A3B56] rounded-lg text-sm text-[#E8F0FE] placeholder-[#5F7FB8] focus:outline-none focus:border-[#4EA0FC] focus:ring-1 focus:ring-[#4EA0FC]/30 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1.5">Usuario</label>
                <input type="text" value={username} disabled
                  className="w-full px-3.5 py-2.5 bg-[#162033] border border-[#2A3B56] rounded-lg text-sm text-[#5F7FB8] cursor-not-allowed" />
              </div>

              <div className="border-t border-[#2A3B56] pt-4">
                <p className="text-xs font-semibold text-[#8CA3E6] uppercase tracking-wider mb-3">Cambiar Contraseña</p>
                <div className="space-y-3">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña"
                    className="w-full px-3.5 py-2.5 bg-[#1B263B] border border-[#2A3B56] rounded-lg text-sm text-[#E8F0FE] placeholder-[#5F7FB8] focus:outline-none focus:border-[#4EA0FC] focus:ring-1 focus:ring-[#4EA0FC]/30 transition-all" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña"
                    className="w-full px-3.5 py-2.5 bg-[#1B263B] border border-[#2A3B56] rounded-lg text-sm text-[#E8F0FE] placeholder-[#5F7FB8] focus:outline-none focus:border-[#4EA0FC] focus:ring-1 focus:ring-[#4EA0FC]/30 transition-all" />
                </div>
              </div>

              {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#2A3B56]">
              <button onClick={cancelEditing} className="med-btn-secondary text-xs px-4 py-2">Cancelar</button>
              <button onClick={() => setShowConfirmSave(true)} disabled={saving} className="med-btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar Cambios
              </button>
            </div>

            {showConfirmSave && (
              <ConfirmModal
                title="Guardar Cambios"
                message="¿Confirmar los cambios en tu perfil?"
                onConfirm={() => { setShowConfirmSave(false); handleSave() }}
                onCancel={() => setShowConfirmSave(false)}
                type="warning"
              />
            )}
          </>
        ) : (
          <>
            <div className="px-6 py-5 space-y-5">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#4EA0FC]/40 bg-[#24324A]">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#E8F0FE] bg-gradient-to-br from-[#4EA0FC] to-[#19CF8D]">
                      {user.avatar}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1">Nombre</label>
                  <p className="text-sm font-medium text-[#E8F0FE]">{user.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8CA3E6] uppercase tracking-wider mb-1">Usuario</label>
                  <p className="text-sm font-medium text-[#E8F0FE]">{username}</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Shield className="w-4 h-4 text-[#8CA3E6]" />
                  <span className="text-xs font-semibold text-[#4EA0FC] uppercase tracking-wider">{user.role}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#2A3B56]">
              <button onClick={onClose} className="med-btn-secondary text-xs px-4 py-2">Cerrar</button>
              <button onClick={startEditing} className="med-btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Editar Perfil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
