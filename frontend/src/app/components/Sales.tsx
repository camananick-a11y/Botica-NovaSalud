import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, ShoppingCart, Plus, Minus, Trash2, Check, ShoppingBag, Receipt, X, User, CreditCard, Banknote, Pill, FileText, Printer, AlertCircle, Trash, Loader2, ChevronRight, ChevronLeft, Download } from 'lucide-react'
import api from '../../api/axios'
import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

interface CartItem {
  id_medicamento: number
  nombre: string
  presentacion: string
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
  const [pdfData, setPdfData] = useState<any>(null)
  const cartRef = useRef(cart)
  cartRef.current = cart

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
      return [...prev, { id_medicamento: med.id_medicamento, nombre: med.nombre, presentacion: med.presentacion_nombre || '', precio: parseFloat(med.precio), cantidad: 1, imagen_url: med.imagen_url }]
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

  function setQty(id: number, value: number) {
    const med = medicamentos.find(m => m.id_medicamento === id)
    setCart((prev) => prev.map((i) => {
      if (i.id_medicamento === id) {
        const clamped = Math.max(1, Math.min(isNaN(value) ? 1 : value, med?.stock ?? 99))
        return { ...i, cantidad: clamped }
      }
      return i
    }))
  }

  function generatePDF() {
    const pd = pdfData
    if (!pd) return
    const cliente = pd.cliente || {}
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pw = 210
    const m = 15
    const cw = pw - m * 2
    const green = [25, 207, 141] as [number, number, number]
    const dark = [27, 38, 59] as [number, number, number]
    const gray = [140, 163, 230] as [number, number, number]
    const bg = [248, 250, 252] as [number, number, number]

    // ─── Header bar ───
    doc.setFillColor(...dark)
    doc.rect(0, 0, pw, 42, 'F')
    doc.setFontSize(20)
    doc.setTextColor(...green)
    doc.setFont('helvetica', 'bold')
    doc.text('NOVA SALUD', pw / 2, 16, { align: 'center' })
    doc.setFontSize(7.5)
    doc.setTextColor(...gray)
    doc.setFont('helvetica', 'normal')
    doc.text('Farmacia y productos farmacéuticos · RUC 20600789012', pw / 2, 24, { align: 'center' })
    doc.text('Av. Principal 1234, Lima · Tel: (01) 555-1234 · info@novasalud.pe', pw / 2, 30, { align: 'center' })

    // ─── Title block ───
    let y = 50
    doc.setDrawColor(...green)
    doc.setLineWidth(0.6)
    doc.line(m, y, pw - m, y)
    y += 7
    doc.setFontSize(13)
    doc.setTextColor(...dark)
    doc.setFont('helvetica', 'bold')
    doc.text('BOLETA DE VENTA ELECTRÓNICA', pw / 2, y, { align: 'center' })
    y += 5
    doc.setFontSize(9)
    doc.setTextColor(...gray)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° ${pd.serie || '-'}`, pw / 2, y, { align: 'center' })
    y += 6
    doc.setDrawColor(220, 220, 230)
    doc.setLineWidth(0.3)
    doc.line(m, y, pw - m, y)

    // ─── Symmetric info boxes ───
    y += 6
    const half = cw / 2
    const boxPad = 3
    const lineH = 4.5

    // Helper: draw a box with title and 3 rows
    function drawInfoBox(x: number, title: string, lines: [string, string][]) {
      const boxY = y
      const boxW = half - 2
      // Title
      doc.setFontSize(7)
      doc.setTextColor(...gray)
      doc.setFont('helvetica', 'bold')
      doc.text(title, x, boxY)
      // Separator
      const ty = boxY + 2
      doc.setDrawColor(220, 220, 230)
      doc.setLineWidth(0.2)
      doc.line(x, ty, x + boxW, ty)
      // Rows
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      lines.forEach(([label, value], i) => {
        const ry = ty + 2 + (i + 1) * lineH + boxPad
        doc.setTextColor(...gray)
        doc.text(label, x, ry)
        doc.setTextColor(40, 40, 50)
        doc.text(value, x + 22, ry)
      })
    }

    const fechaStr = pd.fecha
      ? new Date(pd.fecha).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('es-PE')
    const tipoStr = pd.tipo === 'factura' ? 'Factura' : 'Boleta'

    drawInfoBox(m, 'DATOS DEL COMPROBANTE', [
      ['Serie:', pd.serie || '-'],
      ['Fecha:', fechaStr],
      ['Tipo:', tipoStr],
    ])

    drawInfoBox(m + half, 'DATOS DEL CLIENTE', [
      ['Cliente:', cliente.nombre || '-'],
      ['Doc.:', cliente.tipo_documento && cliente.numero_documento ? `${cliente.tipo_documento} ${cliente.numero_documento}` : '-'],
      ['Direc.:', cliente.direccion || '-'],
    ])

    // ─── Table ───
    y += 32
    doc.setDrawColor(220, 220, 230)
    doc.setLineWidth(0.3)
    doc.line(m, y, pw - m, y)
    y += 5

    // Columns: #(10) + Producto(58) + Presentación(28) + Cant.(14) + P.Unit.(30) + Subtotal(40) = 180
    const colW = [10, 58, 28, 14, 30, 40]
    const rows = (pd.detalles || []).map((item: any, idx: number) => [
      String(idx + 1),
      item.nombre || '-',
      item.presentacion || '-',
      String(item.cantidad),
      `S/ ${parseFloat(item.precio).toFixed(2)}`,
      `S/ ${(item.cantidad * item.precio).toFixed(2)}`,
    ])
    const total = pd.detalles
      ? (pd.detalles as any[]).reduce((s: number, i: any) => s + i.cantidad * i.precio, 0)
      : 0

    ;(doc as any).autoTable({
      startY: y,
      margin: { left: m, right: m },
      tableWidth: cw,
      head: [['#', 'Producto', 'Presentación', 'Cant.', 'P. Unit.', 'Subtotal']],
      body: rows,
      foot: [['', '', '', '', 'TOTAL', `S/ ${parseFloat(total).toFixed(2)}`]],
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      headStyles: {
        fillColor: [...green],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2,
      },
      footStyles: {
        fillColor: [...dark],
        textColor: [...green],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2.5,
      },
      bodyStyles: { textColor: [50, 50, 60] },
      columnStyles: {
        0: { halign: 'center', cellWidth: colW[0] },
        1: { cellWidth: colW[1] },
        2: { cellWidth: colW[2], halign: 'center' },
        3: { halign: 'center', cellWidth: colW[3] },
        4: { halign: 'right', cellWidth: colW[4] },
        5: { halign: 'right', cellWidth: colW[5] },
      },
      alternateRowStyles: { fillColor: bg },
    })

    // ─── Total card (same width as table) ───
    y = (doc as any).lastAutoTable.finalY + 7
    doc.setFillColor(...dark)
    doc.roundedRect(m, y, cw, 11, 2, 2, 'F')
    doc.setFontSize(10)
    doc.setTextColor(...green)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL A PAGAR:', m + 12, y + 7.5)
    doc.setFontSize(15)
    doc.text(`S/ ${parseFloat(total).toFixed(2)}`, pw - m - 12, y + 7.5, { align: 'right' })

    // ─── Footer ───
    y += 22
    doc.setFontSize(7)
    doc.setTextColor(...gray)
    doc.setFont('helvetica', 'normal')
    doc.text('Gracias por su preferencia. Este comprobante es válido para reclamos y cambios.', pw / 2, y, { align: 'center' })
    y += 4
    doc.text('Generado el: ' + new Date().toLocaleString('es-PE'), pw / 2, y, { align: 'center' })
    y += 4
    doc.setFontSize(6)
    doc.text('Nova Salud © 2026 · Sistema Farmacéutico Inteligente', pw / 2, y, { align: 'center' })

    doc.save(`Boleta-${pd.serie || 'venta'}.pdf`)
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
      const { data: created } = await api.post('/ventas/comprobantes/', {
        tipo: voucher, serie: `V-${Date.now()}`.slice(-8), id_cliente: cliente.id_cliente,
        detalles: cart.map((i) => ({ id_medicamento: i.id_medicamento, cantidad: i.cantidad, precio_unitario: i.precio })),
      })
      setPdfData({ serie: created.serie, tipo: created.tipo, detalles: [...cart], cliente, fecha: new Date().toISOString() })
      setDone(created)
    } catch (err: any) { setError('Error en venta') } finally { setSaving(false) }
  }

  function newSale() { setDone(null); setCart([]); setCustomer(''); setCashGiven(''); }

  if (done) {
    return (
      <div className="fixed inset-0 z-[200] med-modal-overlay">
        <div className="w-full max-w-xs animate-in zoom-in duration-500">
          <div className="med-card-dark overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#19CF8D] to-[#15B87C] p-6 text-center text-white"><p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">EXITO</p><p className="text-xl font-black">{done.serie}</p></div>
            <div className="p-10 text-center"><p className="med-section-title mb-1">Monto Total</p><p className="text-4xl font-black text-[#E8F0FE] tracking-tighter">S/ {total.toFixed(2)}</p></div>
          </div>
          <div className="space-y-2">
            <button onClick={generatePDF} className="w-full py-4 med-btn-primary text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Descargar Boleta (PDF)</button>
            <button onClick={newSale} className="w-full py-3.5 med-btn-secondary text-[9px] uppercase tracking-widest">Nueva Venta</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      
      <div className="flex-1 flex flex-col min-w-0 bg-background border-r border-[#2A3B56] overflow-hidden">
        <div className="p-6 bg-[#1B263B]/80 border-b border-[#2A3B56] space-y-4">
          <div className="flex items-center justify-between"><h1 className="text-xl font-black text-[#E8F0FE] tracking-tighter">Ventas</h1><button onClick={() => setIsCartCollapsed(!isCartCollapsed)} className="p-2.5 med-card-dark hover:border-[#4EA0FC] transition-all">{isCartCollapsed ? <ChevronLeft className="w-4 h-4 text-[#4EA0FC]" /> : <ChevronRight className="w-4 h-4 text-[#8CA3E6]" />}</button></div>
          <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7FB8]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="¿Qué buscas?" className="med-input pl-10" /></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className={`grid gap-4 ${isCartCollapsed ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
            {filtered.map((med) => {
              const inCart = cart.find((i) => i.id_medicamento === med.id_medicamento)
              const isLow = (med.stock ?? 0) <= 0
              return (
                <button key={med.id_medicamento} onClick={() => toggleProduct(med)}
                  className={`text-left p-4 rounded-xl border-2 transition-all relative group flex flex-col h-full ${
                    isLow ? 'bg-[#24324A]/40 opacity-40' : inCart ? 'border-[#19CF8D] bg-[#19CF8D]/10' : 'med-card-dark hover:border-[#4EA0FC]'
                  }`}>
                  <div className="h-28 w-full rounded-xl bg-[#24324A] mb-3 flex items-center justify-center p-4">{med.imagen_url ? <img src={med.imagen_url} alt={med.nombre} className="w-full h-full object-contain" /> : <Pill className="w-8 h-8 text-[#5F7FB8]" />}</div>
                  <h4 className="font-black text-[#E8F0FE] text-xs leading-tight mb-0.5 pr-6 line-clamp-2 min-h-[2rem] tracking-tight">{med.nombre}</h4>
                  <p className="text-[8px] font-black text-[#8CA3E6] uppercase tracking-widest mb-3 truncate">{med.laboratorio_nombre || '-'}</p>
                  <div className="mt-auto flex items-center justify-between"><p className="text-base font-black text-[#E8F0FE] tracking-tighter">S/ {med.precio}</p><span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${isLow ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#19CF8D]/10 text-[#19CF8D]'}`}>{med.stock}</span></div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className={`flex flex-col bg-[#1B263B] border-l border-[#2A3B56] z-20 relative transition-all duration-300 ${isCartCollapsed ? 'w-16' : 'w-80'}`}>
        <div className={`p-5 border-b border-[#2A3B56] flex items-center ${isCartCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCartCollapsed ? 'flex-col' : ''}`}>
            <ShoppingCart className={`text-[#E8F0FE] transition-all ${isCartCollapsed ? 'w-4 h-4' : 'w-5 h-5'}`} />
            {!isCartCollapsed && <h2 className="font-black text-[#E8F0FE] text-sm tracking-tighter">Cesta</h2>}
            {isCartCollapsed && <span className="text-[9px] font-black text-[#19CF8D] border border-[#19CF8D]/30 px-1.5 rounded-md">{cartQty}</span>}
          </div>
        </div>

        {!isCartCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {cart.map((item) => (
                <div key={item.id_medicamento} className="bg-[#24324A] rounded-xl p-4 border border-[#2A3B56] hover:border-[#4EA0FC]/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#2A3B56] p-2 flex-shrink-0">{item.imagen_url ? <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-contain" /> : <Pill className="w-5 h-5 text-[#5F7FB8]" />}</div>
                    <div className="flex-1 min-w-0"><p className="text-[10px] font-black text-[#E8F0FE] leading-tight truncate">{item.nombre}</p></div>
                  </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#2A3B56]/50">
                      <div className="flex items-center gap-1.5 bg-[#2A3B56] p-1 rounded-lg">
                        <button onClick={() => updateQty(item.id_medicamento, -1)} className="w-6 h-6 rounded-md bg-[#24324A] flex items-center justify-center text-[#8CA3E6] hover:text-[#EF4444]"><Minus className="w-3 h-3" /></button>
                        <input type="number" min={1} max={medicamentos.find(m => m.id_medicamento === item.id_medicamento)?.stock ?? 99}
                          value={item.cantidad}
                          onChange={(e) => setQty(item.id_medicamento, parseInt(e.target.value) || 1)}
                          className="w-8 text-center text-xs font-black bg-transparent text-[#E8F0FE] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                        <button onClick={() => updateQty(item.id_medicamento, 1)} className="w-6 h-6 rounded-md bg-gradient-to-r from-[#4EA0FC] to-[#3B82F6] flex items-center justify-center text-white"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="text-sm font-black text-[#E8F0FE] tracking-tighter">S/ {(item.precio * item.cantidad).toFixed(2)}</p>
                    </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-[#162033] rounded-t-2xl space-y-3 border-t border-[#2A3B56]">
              <div className="flex justify-between items-center med-section-title"><span>Total</span><span className="text-lg text-[#19CF8D] font-black">S/ {total.toFixed(2)}</span></div>
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} list="cli-list" placeholder="Cliente..." className="med-input text-[10px]" /><datalist id="cli-list">{clientes.map((c: any) => <option key={c.id_cliente} value={c.nombre} />)}</datalist>
              {error && <div className="bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold text-center px-3 py-2 rounded-lg border border-[#EF4444]/30">{error}</div>}
              <button onClick={completeSale} disabled={saving || cart.length === 0} className="w-full py-3.5 med-btn-primary text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Receipt className="w-4 h-4" /> Cobrar</>}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
