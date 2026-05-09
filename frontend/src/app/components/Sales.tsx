import { useState, useEffect, useMemo } from 'react'
import { Search, ShoppingCart, Plus, Minus, Trash2, Check, ShoppingBag, Receipt, X, User, CreditCard, Banknote, Pill, FileText, Printer, AlertCircle, Trash, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import api from '../../api/axios'

interface CartItem {
  id_medicamento: number
  nombre: string
  precio: number
  cantidad: number
  imagen_url?: string
}

export function Sales() {
  const [medicamentos, setMedicamentos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [voucher, setVoucher] = useState<'boleta' | 'factura'>('boleta')
  const [customer, setCustomer] = useState('')
  const [payment, setPayment] = useState<'cash' | 'card'>('cash')
  const [cashGiven, setCashGiven] = useState('')
  const [done, setDone] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [outOfStockAlert, setOutOfStockAlert] = useState<string | null>(null)
  const [isCartCollapsed, setIsCartCollapsed] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/medicamentos/'), api.get('/clientes/')]).then(([medRes, cliRes]) => {
      setMedicamentos(medRes.data.results || medRes.data)
      setClientes(cliRes.data.results || cliRes.data)
    }).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    let meds = [...medicamentos]
    if (search) {
      const q = search.toLowerCase()
      meds = meds.filter((m) => m.nombre.toLowerCase().includes(q) || (m.laboratorio_nombre || '').toLowerCase().includes(q))
    }
    return meds
  }, [search, medicamentos])

  function toggleProduct(med: any) {
    if ((med.stock ?? 0) <= 0) {
      setOutOfStockAlert(`"${med.nombre}" agotado.`)
      setTimeout(() => setOutOfStockAlert(null), 2000)
      return
    }
    setCart((prev) => {
      const ex = prev.find((i) => i.id_medicamento === med.id_medicamento)
      if (ex) return prev.filter((i) => i.id_medicamento !== med.id_medicamento)
      return [...prev, { id_medicamento: med.id_medicamento, nombre: med.nombre, precio: parseFloat(med.precio), cantidad: 1, imagen_url: med.imagen_url }]
    })
    if (isCartCollapsed) setIsCartCollapsed(false)
  }

  function updateQty(id: number, delta: number) {
    const med = medicamentos.find(m => m.id_medicamento === id)
    setCart((prev) => prev.map((i) => {
      if (i.id_medicamento === id) {
        const next = i.cantidad + delta
        if (delta > 0 && next > (med?.stock ?? 0)) return i
        return { ...i, cantidad: Math.max(1, next) }
      }
      return i
    }))
  }

  const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const cartQty = cart.reduce((s, i) => s + i.cantidad, 0)
  const cashGivenNum = parseFloat(cashGiven) || 0
  const change = cashGivenNum - total

  async function completeSale() {
    const cliente = clientes.find((c) => c.nombre === customer)
    if (!cliente) { setError('Cliente inválido'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/ventas/comprobantes/', {
        tipo: voucher, serie: `V-${Date.now()}`.slice(-8), id_cliente: cliente.id_cliente,
        detalles: cart.map((i) => ({ id_medicamento: i.id_medicamento, cantidad: i.cantidad, precio_unitario: i.precio })),
      })
      setDone(data)
    } catch (err: any) { setError('Error en venta') } finally { setSaving(false) }
  }

  function newSale() { setDone(null); setCart([]); setCustomer(''); setCashGiven(''); }

  if (done) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500">
        <div className="w-full max-w-xs animate-in zoom-in duration-500">
          <div className="bg-white rounded-[32px] border border-white/20 shadow-2xl overflow-hidden mb-6">
            <div className="bg-emerald-600 p-6 text-center text-white"><p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">EXITO</p><p className="text-xl font-black">{done.serie}</p></div>
            <div className="p-10 text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Total</p><p className="text-4xl font-black text-slate-900 tracking-tighter">S/ {done.total}</p></div>
          </div>
          <button onClick={newSale} className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl text-[9px] uppercase tracking-widest shadow-xl">Continuar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-slate-100" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      
      {/* Catalog */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 border-r border-slate-200 overflow-hidden">
        <div className="p-6 bg-white/60 backdrop-blur-xl border-b border-slate-200 space-y-4">
          <div className="flex items-center justify-between"><h1 className="text-xl font-black text-slate-900 tracking-tighter">Ventas</h1><button onClick={() => setIsCartCollapsed(!isCartCollapsed)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 transition-all shadow-sm">{isCartCollapsed ? <ChevronLeft className="w-4 h-4 text-emerald-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}</button></div>
          <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="¿Qué buscas?" className="w-full pl-12 pr-6 py-2.5 rounded-xl border border-white bg-white/60 focus:bg-white focus:outline-none text-xs font-bold transition-all" /></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <div className={`grid gap-5 ${isCartCollapsed ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
            {filtered.map((med) => {
              const inCart = cart.find((i) => i.id_medicamento === med.id_medicamento)
              const isLow = (med.stock ?? 0) <= 0
              return (
                <button key={med.id_medicamento} onClick={() => toggleProduct(med)}
                  className={`text-left p-4 rounded-[28px] border-2 transition-all relative group flex flex-col h-full shadow-sm ${
                    isLow ? 'bg-white/40 opacity-40' : inCart ? 'border-emerald-500 bg-emerald-50/50' : 'border-white bg-white hover:shadow-lg hover:-translate-y-1'
                  }`}>
                  <div className="h-32 w-full rounded-[20px] bg-slate-50/50 mb-3 flex items-center justify-center p-6">{med.imagen_url ? <img src={med.imagen_url} alt={med.nombre} className="w-full h-full object-contain" /> : <Pill className="w-8 h-8 text-slate-100" />}</div>
                  <h4 className="font-black text-slate-900 text-xs leading-tight mb-0.5 pr-6 line-clamp-2 min-h-[2rem] tracking-tight">{med.nombre}</h4>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-4 truncate">{med.laboratorio_nombre || '-'}</p>
                  <div className="mt-auto flex items-center justify-between"><p className="text-base font-black text-slate-900 tracking-tighter">S/ {med.precio}</p><span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${isLow ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>{med.stock}</span></div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className={`flex flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.02)] z-20 overflow-hidden relative transition-all duration-300 ${isCartCollapsed ? 'w-16' : 'w-80'}`}>
        <div className={`p-6 border-b border-slate-50 bg-slate-50/30 flex items-center ${isCartCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCartCollapsed ? 'flex-col' : ''}`}>
            <ShoppingCart className={`text-slate-900 transition-all ${isCartCollapsed ? 'w-4 h-4' : 'w-5 h-5'}`} />
            {!isCartCollapsed && <h2 className="font-black text-slate-900 text-sm tracking-tighter">Cesta</h2>}
            {isCartCollapsed && <span className="text-[9px] font-black text-emerald-600 border border-emerald-100 px-1.5 rounded-md">{cartQty}</span>}
          </div>
        </div>

        {!isCartCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {cart.map((item) => (
                <div key={item.id_medicamento} className="bg-slate-50/50 rounded-[24px] p-4 border border-transparent hover:border-emerald-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white p-2 shadow-sm border border-slate-100 flex-shrink-0">{item.imagen_url ? <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-contain" /> : <Pill className="w-6 h-6 text-slate-100" />}</div>
                    <div className="flex-1 min-w-0"><p className="text-[10px] font-black text-slate-900 leading-tight truncate">{item.nombre}</p></div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
                      <button onClick={() => updateQty(item.id_medicamento, -1)} className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-black w-4 text-center">{item.cantidad}</span>
                      <button onClick={() => updateQty(item.id_medicamento, 1)} className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white"><Plus className="w-3 h-3" /></button>
                    </div>
                    <p className="text-sm font-black text-slate-900 tracking-tighter">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-900 rounded-t-[40px] space-y-4 shadow-2xl">
              <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest"><span>Total</span><span className="text-lg text-emerald-400">S/ {total.toFixed(2)}</span></div>
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} list="cli-list" placeholder="Cliente..." className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white text-[10px] font-bold outline-none" /><datalist id="cli-list">{clientes.map((c: any) => <option key={c.id_cliente} value={c.nombre} />)}</datalist>
              <button onClick={completeSale} disabled={saving || cart.length === 0} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Receipt className="w-4 h-4" /> Cobrar</>}</button>
            </div>
          </>
        )}
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  )
}
