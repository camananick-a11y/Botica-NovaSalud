import { AlertCircle, ShieldAlert } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning'
  isOpen?: boolean
}

export function ConfirmModal({ title, message, onConfirm, onCancel, type = 'danger', isOpen = true }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="med-modal-overlay animate-in fade-in duration-200" style={{ zIndex: 300 }}>
      <div className="absolute inset-0" onClick={onCancel} />
      <div className="med-modal max-w-[200px] p-3.5 text-center animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${type === 'danger' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#19CF8D]/15 text-[#19CF8D]'}`}>
          {type === 'danger' ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
        </div>
        <h3 className="font-bold text-[#E8F0FE] text-sm mb-0.5">{title}</h3>
        <p className="text-[11px] text-[#8CA3E6] mb-3 leading-relaxed">{message}</p>
        <div className="flex gap-1.5">
          <button onClick={onCancel} className="med-btn-secondary flex-1 text-[11px] py-1.5">Cancelar</button>
          <button onClick={onConfirm} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] text-white transition-all ${type === 'danger' ? 'med-btn-danger' : 'med-btn-primary'}`}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}
