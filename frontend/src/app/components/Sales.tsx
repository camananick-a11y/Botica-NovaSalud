import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, ShoppingCart, Plus, Minus, Trash2, Check, ShoppingBag, Receipt, X, User, CreditCard, Banknote, Pill, FileText, Printer, AlertCircle, Trash, Loader2, ChevronRight, ChevronLeft, ChevronDown, Download } from 'lucide-react'
import api from '../../api/axios'
import { ConfirmModal } from './ConfirmModal'
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
  const [showConfirmSale, setShowConfirmSale] = useState(false)
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientPage, setClientPage] = useState(0)
  const [viewMode, setViewMode] = useState<'venta' | 'historial'>('venta')
  const [historial, setHistorial] = useState<any[]>([])
  const [selectedHistorial, setSelectedHistorial] = useState<any>(null)
  const [historialSearch, setHistorialSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const cartRef = useRef(cart)
  cartRef.current = cart

  const fetchMedicamentos = () => api.get('/medicamentos/?all=true').then(({ data }) => { setMedicamentos(data.results || data) }).catch(() => { })
  const fetchHistorial = () => api.get('/ventas/comprobantes/?all=true').then(({ data }) => { setHistorial(data.results || data) }).catch(() => { })

  useEffect(() => {
    Promise.all([fetchMedicamentos(), api.get('/clientes/')]).then(([_, cliRes]) => {
      setClientes(cliRes.data.results || cliRes.data)
    }).catch(() => { })
  }, [])

  useEffect(() => {
    if (!showClientDropdown) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowClientDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showClientDropdown])

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
    const titleText = pd.tipo === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'
    doc.text(titleText, pw / 2, y, { align: 'center' })
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
    const pagoStr = pd.metodo_pago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'

    drawInfoBox(m, 'DATOS DEL COMPROBANTE', [
      ['Serie:', pd.serie || '-'],
      ['Fecha:', fechaStr],
      ['Tipo:', tipoStr],
      ['Pago:', pagoStr],
    ])

    drawInfoBox(m + half, 'DATOS DEL CLIENTE', [
      ['Cliente:', cliente.nombre || '-'],
      ['Doc.:', cliente.tipo_documento && cliente.numero_documento ? `${cliente.tipo_documento} ${cliente.numero_documento}` : '-'],
      ['Direc.:', cliente.direccion || '-'],
    ])

    // ─── Table ───
    y += 38
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

      ; (doc as any).autoTable({
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

    // ─── IGV / Subtotal breakdown (for factura) ───
    y = (doc as any).lastAutoTable.finalY + 7
    if (pd.tipo === 'factura') {
      doc.setFontSize(8)
      doc.setTextColor(...gray)
      doc.setFont('helvetica', 'normal')
      doc.text(`Subtotal: S/ ${parseFloat(pd.subtotal || total).toFixed(2)}`, m + 4, y)
      y += 4
      doc.text(`IGV (18%): S/ ${parseFloat(pd.igv || 0).toFixed(2)}`, m + 4, y)
      y += 7
    }

    // ─── Total card (same width as table) ───
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

    const prefix = pd.tipo === 'factura' ? 'Factura' : 'Boleta'
    doc.save(`${prefix}-${pd.serie || 'venta'}.pdf`)
  }

  const subtotal = cart.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const igv = voucher === 'factura' ? subtotal * 0.18 : 0
  const total = subtotal + igv
  const cartQty = cart.reduce((s, i) => s + i.cantidad, 0)
  const cashGivenNum = parseFloat(cashGiven) || 0
  const change = cashGivenNum - total

  const filteredClients = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.numero_documento || '').includes(clientSearch)
  )

  async function completeSale() {
    const cliente = clientes.find((c) => c.nombre === customer)
    if (!cliente) { setError('Cliente inválido'); return }
    setSaving(true)
    try {
      const { data: created } = await api.post('/ventas/comprobantes/', {
        tipo: voucher, serie: `V-${Date.now()}`.slice(-8), id_cliente: cliente.id_cliente,
        metodo_pago: payment,
        detalles: cart.map((i) => ({ id_medicamento: i.id_medicamento, cantidad: i.cantidad, precio_unitario: i.precio })),
      })
      setPdfData({ serie: created.serie, tipo: created.tipo, subtotal: created.subtotal, igv: created.igv, total: created.total, metodo_pago: payment, detalles: [...cart], cliente, fecha: new Date().toISOString() })
      setDone(created)
    } catch (err: any) { setError('Error en venta') } finally { setSaving(false) }
  }

  function newSale() { setDone(null); setCart([]); setCustomer(''); setCashGiven(''); setViewMode('venta'); fetchMedicamentos() }

  if (done) {
    return (
      <div className="fixed inset-0 z-[200] med-modal-overlay">
        <div className="w-full max-w-xs animate-in zoom-in duration-500">
          <div className="med-card-dark overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#19CF8D] to-[#15B87C] p-6 text-center text-white"><p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">{done.tipo === 'factura' ? 'FACTURA' : 'BOLETA'}</p><p className="text-xl font-black">{done.serie}</p></div>
            <div className="p-10 text-center">
              {done.tipo === 'factura' && (
                <div className="space-y-1 mb-3">
                  <p className="text-[10px] text-[#8CA3E6] font-bold">Subtotal: S/ {parseFloat(done.subtotal || subtotal).toFixed(2)}</p>
                  <p className="text-[10px] text-[#F59E0B] font-bold">IGV (18%): S/ {parseFloat(done.igv || igv).toFixed(2)}</p>
                </div>
              )}
              <p className="text-[9px] font-bold text-[#8CA3E6] mb-1 uppercase tracking-widest">{payment === 'card' ? 'Tarjeta' : 'Efectivo'}</p>
              <p className="med-section-title mb-1">Monto Total</p><p className="text-4xl font-black text-[#E8F0FE] tracking-tighter">S/ {parseFloat(done.total || total).toFixed(2)}</p></div>
          </div>
          <div className="space-y-2">
            <button onClick={generatePDF} className="w-full py-4 med-btn-primary text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Descargar {done.tipo === 'factura' ? 'Factura' : 'Boleta'} (PDF)</button>
            <button onClick={newSale} className="w-full py-3.5 med-btn-secondary text-[9px] uppercase tracking-widest">Nueva Venta</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-visible bg-background">

      <div className="flex-1 flex flex-col min-w-0 bg-background border-r border-[#2A3B56] overflow-hidden">
        <div className="p-6 bg-[#1B263B]/80 border-b border-[#2A3B56] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 bg-[#24324A] p-1 rounded-xl">
              <button onClick={() => { setViewMode('venta'); fetchMedicamentos() } }
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'venta' ? 'bg-[#19CF8D] text-[#0F1729]' : 'text-[#8CA3E6] hover:text-[#E8F0FE]'}`}>Venta</button>
              <button onClick={() => { setViewMode('historial'); fetchHistorial() } }
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'historial' ? 'bg-[#19CF8D] text-[#0F1729]' : 'text-[#8CA3E6] hover:text-[#E8F0FE]'}`}>Historial</button>
            </div>
          </div>
          {viewMode === 'venta' ? (
            <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7FB8]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="¿Qué buscas?" className="med-input pl-10" /></div>
          ) : (
            <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7FB8]" /><input value={historialSearch} onChange={(e) => setHistorialSearch(e.target.value)} placeholder="Buscar por serie, cliente..." className="med-input pl-10" /></div>
          )}
        </div>

        {viewMode === 'historial' ? (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {selectedHistorial ? (
              <div>
                <button onClick={() => setSelectedHistorial(null)} className="flex items-center gap-2 text-[10px] font-bold text-[#8CA3E6] hover:text-[#E8F0FE] mb-4 transition-colors"><ChevronLeft className="w-4 h-4" /> Volver al historial</button>
                <div className="med-card-dark p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-black text-[#E8F0FE]">{selectedHistorial.tipo === 'factura' ? 'FACTURA' : 'BOLETA'} {selectedHistorial.serie}</p>
                      <p className="text-[10px] text-[#8CA3E6]">{new Date(selectedHistorial.fecha).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${selectedHistorial.metodo_pago === 'efectivo' ? 'bg-[#19CF8D]/10 text-[#19CF8D]' : 'bg-[#4EA0FC]/10 text-[#4EA0FC]'}`}>{selectedHistorial.metodo_pago}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-[#24324A] rounded-xl">
                    <div><p className="text-[8px] font-bold text-[#8CA3E6] uppercase tracking-widest mb-1">Cliente</p><p className="text-xs font-bold text-[#E8F0FE]">{selectedHistorial.cliente_nombre || '-'}</p></div>
                    <div><p className="text-[8px] font-bold text-[#8CA3E6] uppercase tracking-widest mb-1">Documento</p><p className="text-xs font-bold text-[#E8F0FE]">{selectedHistorial.cliente_tipo_documento} {selectedHistorial.cliente_numero_documento}</p></div>
                    <div><p className="text-[8px] font-bold text-[#8CA3E6] uppercase tracking-widest mb-1">Usuario</p><p className="text-xs font-bold text-[#E8F0FE]">{selectedHistorial.usuario_nombre || '-'}</p></div>
                    <div><p className="text-[8px] font-bold text-[#8CA3E6] uppercase tracking-widest mb-1">Total</p><p className="text-xs font-bold text-[#19CF8D]">S/ {parseFloat(selectedHistorial.total).toFixed(2)}</p></div>
                  </div>
                  {selectedHistorial.tipo === 'factura' && (
                    <div className="flex gap-4 text-[10px] text-[#8CA3E6]"><span>Subtotal: S/ {parseFloat(selectedHistorial.subtotal).toFixed(2)}</span><span>IGV: S/ {parseFloat(selectedHistorial.igv).toFixed(2)}</span></div>
                  )}
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-[#8CA3E6] uppercase tracking-widest">Detalle</p>
                    {(selectedHistorial.detalles || []).map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#1B263B] rounded-xl">
                        <div><p className="text-xs font-bold text-[#E8F0FE]">{d.medicamento_nombre}</p><p className="text-[9px] text-[#8CA3E6]">{d.medicamento_presentacion}</p></div>
                        <div className="text-right"><p className="text-xs font-bold text-[#E8F0FE]">{d.cantidad} x S/ {parseFloat(d.precio_unitario).toFixed(2)}</p><p className="text-[9px] text-[#19CF8D] font-bold">S/ {parseFloat(d.subtotal).toFixed(2)}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {historial.filter((c: any) =>
                  !historialSearch ||
                  (c.serie || '').toLowerCase().includes(historialSearch.toLowerCase()) ||
                  (c.cliente_nombre || '').toLowerCase().includes(historialSearch.toLowerCase())
                ).map((c: any) => (
                  <button key={c.id_comprobante} onClick={() => setSelectedHistorial(c)}
                    className="w-full med-card-dark p-4 rounded-xl hover:border-[#4EA0FC]/50 transition-all text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${c.tipo === 'factura' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#4EA0FC]/10 text-[#4EA0FC]'}`}>{c.tipo === 'factura' ? 'FACT' : 'BOL'}</span>
                        <p className="text-xs font-bold text-[#E8F0FE]">{c.serie}</p>
                      </div>
                      <p className="text-sm font-black text-[#19CF8D]">S/ {parseFloat(c.total).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#8CA3E6]">
                      <span>{c.cliente_nombre || 'Sin cliente'}</span>
                      <span>{new Date(c.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                ))}
                {historial.length === 0 && <p className="text-center text-[#8CA3E6] text-xs py-10">Cargando historial...</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div className={`grid gap-4 ${isCartCollapsed ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
              {filtered.map((med) => {
                const inCart = cart.find((i) => i.id_medicamento === med.id_medicamento)
                const isLow = (med.stock ?? 0) <= 0
                return (
                  <button key={med.id_medicamento} onClick={() => toggleProduct(med)}
                    className={`text-left p-4 rounded-xl border-2 transition-all relative group flex flex-col h-full ${isLow ? 'bg-[#24324A]/40 opacity-40' : inCart ? 'border-[#19CF8D] bg-[#19CF8D]/10' : 'med-card-dark hover:border-[#4EA0FC]'
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
        )}
      </div>

      <div className={`flex flex-col bg-[#1B263B] border-l border-[#2A3B56] z-10 relative transition-all duration-300 ${viewMode === 'historial' ? 'w-0 overflow-hidden border-0' : isCartCollapsed ? 'w-16' : 'w-80'}`}>
        <div className={`p-5 border-b border-[#2A3B56] flex items-center ${isCartCollapsed ? 'justify-center' : 'justify-between'}`}>
          <button onClick={() => setIsCartCollapsed(!isCartCollapsed)} className={`flex items-center gap-3 ${isCartCollapsed ? 'flex-col cursor-pointer' : 'cursor-pointer'}`}>
            <ShoppingCart className={`text-[#E8F0FE] transition-all ${isCartCollapsed ? 'w-4 h-4' : 'w-5 h-5'}`} />
            {!isCartCollapsed && <h2 className="font-black text-[#E8F0FE] text-sm tracking-tighter">Carrito</h2>}
            {isCartCollapsed && <span className="text-[9px] font-black text-[#19CF8D] border border-[#19CF8D]/30 px-1.5 rounded-md">{cartQty}</span>}
          </button>
          {!isCartCollapsed && cart.length > 0 && (
            <button onClick={() => setCart([])} className="p-2 rounded-lg hover:bg-[#24324A] text-[#8CA3E6] hover:text-[#EF4444] transition-all" title="Vaciar carrito">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
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
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-[#8CA3E6]"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
                {voucher === 'factura' && (
                  <div className="flex justify-between items-center text-[10px] text-[#F59E0B]"><span>IGV (18%)</span><span>S/ {igv.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-[#2A3B56]"><span className="med-section-title">Total</span><span className="text-lg text-[#19CF8D] font-black">S/ {total.toFixed(2)}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPayment('cash')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${payment === 'cash' ? 'border-[#19CF8D] bg-[#19CF8D]/10 text-[#19CF8D]' : 'border-[#2A3B56] text-[#8CA3E6] hover:border-[#4EA0FC]'}`}><Banknote className="w-3.5 h-3.5" /> Efectivo</button>
                <button onClick={() => setPayment('card')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${payment === 'card' ? 'border-[#4EA0FC] bg-[#4EA0FC]/10 text-[#4EA0FC]' : 'border-[#2A3B56] text-[#8CA3E6] hover:border-[#4EA0FC]'}`}><CreditCard className="w-3.5 h-3.5" /> Tarjeta</button>
              </div>
              {payment === 'cash' && (
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8CA3E6]">S/</span>
                    <input value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} type="number" min={0} step="0.01" placeholder="Monto recibido..."
                      className="med-input pl-8 text-[10px]" />
                  </div>
                  {cashGivenNum >= total && (
                    <div className="flex items-center justify-between px-3 py-2 bg-[#19CF8D]/10 rounded-xl border border-[#19CF8D]/30">
                      <span className="text-[10px] font-bold text-[#19CF8D]">Cambio</span>
                      <span className="text-sm font-black text-[#19CF8D]">S/ {change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="relative" ref={dropdownRef}>
                <input value={customer} onChange={(e) => { setCustomer(e.target.value); setClientSearch(e.target.value); setShowClientDropdown(true) }}
                  onFocus={() => { setClientSearch(customer); setShowClientDropdown(true) }}
                  placeholder="Cliente..." className="med-input text-[10px]" />
                {showClientDropdown && filteredClients.length > 0 && (
                  <div className="absolute left-0 right-0 bottom-full mb-1 bg-[#1B263B] border border-[#2A3B56] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="max-h-48 overflow-y-auto scrollbar-thin">
                      {filteredClients.slice(clientPage * 5, (clientPage + 1) * 5).map((c: any) => (
                        <button key={c.id_cliente} type="button" onClick={() => {
                          setCustomer(c.nombre)
                          setClientSearch(c.nombre)
                          setShowClientDropdown(false)
                          setClientPage(0)
                          if (c.tipo_documento === 'RUC') setVoucher('factura')
                          else setVoucher('boleta')
                          setError('')
                        }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#24324A] transition-colors text-left">
                          {c.imagen_url ? (
                            <img src={c.imagen_url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-[#4EA0FC]/40" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4EA0FC] to-[#19CF8D] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {c.nombre.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#E8F0FE] truncate">{c.nombre}</p>
                            <p className="text-[9px] text-[#8CA3E6]">{c.tipo_documento}: {c.numero_documento}</p>
                          </div>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${c.tipo_documento === 'RUC' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#4EA0FC]/10 text-[#4EA0FC]'}`}>{c.tipo_documento}</span>
                        </button>
                      ))}
                    </div>
                    {filteredClients.length > 5 && (
                      <div className="flex items-center justify-between px-2 py-1.5 border-t border-[#2A3B56] bg-[#162033]">
                        <button onClick={() => setClientPage(p => Math.max(0, p - 1))} disabled={clientPage === 0}
                          className="p-1 rounded text-[#8CA3E6] hover:text-[#E8F0FE] disabled:opacity-30 transition-all">
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[9px] font-medium text-[#5F7FB8]">{clientPage + 1} / {Math.ceil(filteredClients.length / 5)}</span>
                        <button onClick={() => setClientPage(p => Math.min(Math.ceil(filteredClients.length / 5) - 1, p + 1))} disabled={clientPage >= Math.ceil(filteredClients.length / 5) - 1}
                          className="p-1 rounded text-[#8CA3E6] hover:text-[#E8F0FE] disabled:opacity-30 transition-all">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {error && <div className="bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold text-center px-3 py-2 rounded-lg border border-[#EF4444]/30">{error}</div>}
              <button onClick={() => setShowConfirmSale(true)} disabled={saving || cart.length === 0} className="w-full py-3.5 med-btn-primary text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Receipt className="w-4 h-4" /> Cobrar</>}</button>
            </div>
          </>
        )}
      </div>
      <ConfirmModal
        isOpen={showConfirmSale}
        title="Confirmar Venta"
        message={`¿Confirmar la venta por S/ ${total.toFixed(2)}?`}
        onConfirm={() => { setShowConfirmSale(false); completeSale() }}
        onCancel={() => setShowConfirmSale(false)}
        type="warning"
      />
    </div>
  )
}
