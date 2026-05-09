import { AlertCircle, ShieldAlert } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning'
}

export function ConfirmModal({ title, message, onConfirm, onCancel, type = 'danger' }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onCancel} />
      <div className="relative bg-white rounded-[40px] shadow-2xl p-8 max-w-xs w-full text-center animate-in zoom-in duration-300 border border-slate-100">
        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl ${type === 'danger' ? 'bg-red-50 text-red-600 shadow-red-100' : 'bg-amber-50 text-amber-600 shadow-amber-100'}`}>
          {type === 'danger' ? <ShieldAlert className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>
        <h3 className="font-black text-slate-900 text-xl tracking-tighter mb-2">{title}</h3>
        <p className="text-[11px] font-bold text-slate-400 mb-8 uppercase tracking-widest leading-relaxed px-4">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button>
          <button onClick={onConfirm} className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] text-white uppercase tracking-widest transition-all shadow-xl ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'}`}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}
