import { useState, useEffect } from 'react'
import { TrendingUp, Package, Users, AlertCircle, ShoppingCart, ArrowUpRight, Activity, Calendar, Loader2, AlertTriangle, RefreshCw, FileDown, Search } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'
import api from '../../api/axios'
import * as XLSX from 'xlsx'

const CARD_STYLES: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
  emerald: { bg: 'bg-[#24324A]', iconBg: 'bg-[#19CF8D]/15', iconColor: 'text-[#19CF8D]' },
  blue: { bg: 'bg-[#24324A]', iconBg: 'bg-[#4EA0FC]/15', iconColor: 'text-[#4EA0FC]' },
  purple: { bg: 'bg-[#24324A]', iconBg: 'bg-[#8CA3E6]/15', iconColor: 'text-[#8CA3E6]' },
  red: { bg: 'bg-[#24324A]', iconBg: 'bg-[#EF4444]/15', iconColor: 'text-[#EF4444]' },
  amber: { bg: 'bg-[#24324A]', iconBg: 'bg-[#F59E0B]/15', iconColor: 'text-[#F59E0B]' },
}

const TOP_COLORS = ['#4EA0FC', '#19CF8D', '#8CA3E6', '#6E8FCF', '#7A96D6']

function formatSoles(value: number): string {
  return `S/ ${value.toFixed(2)}`
}

export function Dashboard() {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(today)
  const [appliedStart, setAppliedStart] = useState(thirtyDaysAgo)
  const [appliedEnd, setAppliedEnd] = useState(today)
  const [stats, setStats] = useState({ total_ventas: 0, total_medicamentos: 0, total_clientes: 0, ventas_mes: 0, stock_bajo: 0, agotados: 0 })
  const [salesTrend, setSalesTrend] = useState<{ date: string; total: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ medicamento: string; total_vendido: number }[]>([])
  const [topClients, setTopClients] = useState<{ id_cliente__nombre: string; total_compras: number; total_gastado: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const dateParams = () => `&inicio=${appliedStart}&fin=${appliedEnd}`

  useEffect(() => {
    let cancelled = false

    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)

        const [ventasRes, medsRes, clientesRes] = await Promise.all([
          api.get(`/ventas/comprobantes/?all=true${dateParams()}`),
          api.get('/medicamentos/?all=true'),
          api.get('/clientes/'),
        ])

        if (cancelled) return

        const comprobantes = ventasRes.data.results || ventasRes.data
        const medicamentos = medsRes.data.results || medsRes.data
        const clientesData = clientesRes.data.results || clientesRes.data

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const lowStockItems = medicamentos.filter((m: any) => {
          const s = Number(m.stock)
          return s > 0 && s <= 10
        })
        const outOfStock = medicamentos.filter((m: any) => {
          const s = Number(m.stock)
          return s === 0 || isNaN(s)
        })

        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 6)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        const dayTotals: Record<string, number> = {}
        for (let i = 0; i < 7; i++) {
          const d = new Date(sevenDaysAgo)
          d.setDate(sevenDaysAgo.getDate() + i)
          dayTotals[d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })] = 0
        }

        let monthlyTotal = 0
        comprobantes.forEach((sale: any) => {
          const saleDate = new Date(sale.fecha)
          const total = Number(sale.total) || 0

          if (saleDate >= sevenDaysAgo) {
            const key = saleDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
            if (key in dayTotals) {
              dayTotals[key] += total
            }
          }

          if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
            monthlyTotal += total
          }
        })

        setSalesTrend(
          Object.entries(dayTotals).map(([date, total]) => ({ date, total }))
        )

        setStats({
          total_ventas: ventasRes.data.count ?? comprobantes.length,
          total_medicamentos: medsRes.data.count ?? medicamentos.length,
          total_clientes: clientesRes.data.count ?? clientesData.length,
          ventas_mes: monthlyTotal,
          stock_bajo: lowStockItems.length,
          agotados: outOfStock.length,
        })

        try {
          const topRes = await api.get(`/ventas/comprobantes/medicamentos_mas_vendidos/?${dateParams().slice(1)}`)
          if (!cancelled && Array.isArray(topRes.data)) {
            setTopProducts(
              topRes.data.map((item: any) => ({
                medicamento: item.id_medicamento__nombre || 'Desconocido',
                total_vendido: Number(item.total_vendido) || 0,
              }))
            )
          }
        } catch {
          console.warn('medicamentos_mas_vendidos no accesible (requiere Supervisor)')
        }

        try {
          const cliRes = await api.get(`/ventas/comprobantes/clientes_mas_frecuentes/?${dateParams().slice(1)}`)
          if (!cancelled && Array.isArray(cliRes.data)) {
            setTopClients(cliRes.data)
          }
        } catch {
          console.warn('clientes_mas_frecuentes no accesible (requiere Supervisor)')
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.response?.data
            ? typeof err.response.data === 'string'
              ? err.response.data
              : JSON.stringify(err.response.data)
            : err?.message || 'Error al cargar datos del Dashboard'
          setError(msg)
          console.error('Dashboard fetch error:', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()

    const onFocus = () => { if (!cancelled) fetchAll() }
    const onVisible = () => { if (document.visibilityState === 'visible') fetchAll() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedStart, appliedEnd])

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      const res = await api.get('/ventas/comprobantes/exportar/')
      const data = res.data.results ?? res.data ?? []

      const rows = (Array.isArray(data) ? data : []).map((item: any) => ({
        'Serie': item.serie ?? '',
        'Tipo': item.tipo ?? '',
        'Fecha': item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : '',
        'Cliente': item.cliente_nombre ?? '',
        'Documento': item.cliente_numero_documento ?? '',
        'Total (S/)': Number(item.total) || 0,
        'Usuario': item.usuario_nombre ?? '',
        'Productos': (item.detalles ?? []).map((d: any) => `${d.medicamento_nombre} x${d.cantidad}`).join(', '),
      }))

      if (rows.length === 0) {
        alert('No hay ventas para exportar.')
        return
      }

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows)

      const colWidths = Object.keys(rows[0]).map(k => ({
        wch: Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length)) + 2
      }))
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Ventas')
      XLSX.writeFile(wb, `reporte_ventas_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err: any) {
      console.error('Error exportando Excel:', err)
      alert('Error al exportar el reporte de ventas.')
    } finally {
      setExporting(false)
    }
  }

  const cards = [
    { title: 'Ventas', value: stats.total_ventas, icon: ShoppingCart, color: 'emerald' as const },
    { title: 'Productos', value: stats.total_medicamentos, icon: Package, color: 'blue' as const },
    { title: 'Clientes', value: stats.total_clientes, icon: Users, color: 'purple' as const },
    { title: 'Stock Bajo', value: stats.stock_bajo, icon: AlertCircle, color: 'red' as const },
    { title: 'Agotados', value: stats.agotados, icon: AlertTriangle, color: 'amber' as const },
  ]

  const stockOk = Math.max(0, stats.total_medicamentos - stats.stock_bajo - stats.agotados)
  const stockDistribution = [
    { name: 'Agotado', value: stats.agotados },
    { name: 'Crítico', value: stats.stock_bajo },
    { name: 'Disponible', value: stockOk },
  ]

  const renderStockLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (!percent) return null
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))
    return (
      <text x={x} y={y} fill="#E8F0FE" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <div className="h-full bg-background p-6 sm:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#4EA0FC] animate-spin" />
          <p className="text-[#8CA3E6] text-sm font-semibold tracking-wider uppercase">Cargando datos del panel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-background p-6 sm:p-8 flex items-center justify-center">
        <div className="med-card-dark p-8 max-w-lg text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#EF4444] mx-auto" />
          <h2 className="text-xl font-black text-[#E8F0FE]">Error al cargar Dashboard</h2>
          <p className="text-sm text-[#EF4444] break-all">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="med-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background p-6 sm:p-8 overflow-y-auto scrollbar-thin">
      <div className="max-w-screen-2xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#E8F0FE] tracking-tighter">Panel de Control</h1>
            <p className="text-[9px] font-black text-[#8CA3E6] uppercase tracking-widest mt-1 flex items-center gap-2">
              <Activity className="w-3 h-3 text-[#19CF8D]" /> Rendimiento en vivo
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 med-card-dark px-3 py-2">
              <Calendar className="w-4 h-4 text-[#8CA3E6]" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-[#E8F0FE] outline-none w-[110px] [color-scheme:dark]" />
              <span className="text-[#5F7FB8] text-[10px]">→</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-[#E8F0FE] outline-none w-[110px] [color-scheme:dark]" />
            </div>
            <button onClick={() => { setAppliedStart(startDate); setAppliedEnd(endDate) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4EA0FC] hover:bg-[#3B82F6] transition-all text-white text-[10px] font-black uppercase tracking-widest">
              <Search className="w-3.5 h-3.5" /> Verificar
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#19CF8D] hover:bg-[#15B87C] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[#1B263B] text-[10px] font-black uppercase tracking-widest"
            >
              <FileDown className="w-4 h-4" />
              {exporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {cards.map((card, index) => (
            <div key={index} className="med-card-dark p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl ${CARD_STYLES[card.color].iconBg} ${CARD_STYLES[card.color].iconColor} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-3 h-3 text-[#5F7FB8]" />
              </div>
              <p className="med-section-title mb-0.5">{card.title}</p>
              <h3 className="text-2xl font-black text-[#E8F0FE] tracking-tighter">{card.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
          <div className="space-y-6">
          <div className="med-card-dark p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-[#E8F0FE] tracking-tighter">Tendencia de Ventas</h2>
                <p className="med-section-title mt-1">Últimos 7 días</p>
              </div>
              <div className="text-right">
                <p className="med-section-title">Ingresos del periodo</p>
                <p className="text-2xl font-black text-[#E8F0FE]">{formatSoles(salesTrend.reduce((s, d) => s + d.total, 0))}</p>
              </div>
            </div>
            <div className="h-72">
              {salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4EA0FC" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4EA0FC" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3B56" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8CA3E6' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#8CA3E6' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: '1px solid #2A3B56', borderRadius: '8px', color: '#E8F0FE' }} formatter={(value: number) => [formatSoles(value), 'Total']} />
                    <Area type="monotone" dataKey="total" stroke="#4EA0FC" strokeWidth={3} fill="url(#salesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#8CA3E6] text-sm">Sin ventas en los últimos 7 días</div>
              )}
            </div>
          </div>

            <div className="med-card-dark p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-[#E8F0FE] tracking-tighter">Top Clientes</h3>
                  <p className="med-section-title mt-1">Por volumen de compras</p>
                </div>
                {topClients.length > 0 && (
                  <div className="text-right med-section-title">Top {topClients.length}</div>
                )}
              </div>
              <div className="space-y-3">
                {topClients.length > 0 ? (
                  topClients.slice(0, 5).map((client, index) => (
                    <div key={client.id_cliente__nombre} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#24324A]">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black"
                          style={{ backgroundColor: TOP_COLORS[index % TOP_COLORS.length] + '25', color: TOP_COLORS[index % TOP_COLORS.length] }}>
                          {index + 1}
                        </span>
                        <p className="med-section-title truncate">{client.id_cliente__nombre}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#E8F0FE]">{client.total_compras} compras</p>
                        <p className="text-[10px] font-semibold text-[#19CF8D]">{formatSoles(Number(client.total_gastado))}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-32 flex items-center justify-center text-[#8CA3E6] text-sm">Datos no disponibles</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="med-card-dark p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-[#E8F0FE] tracking-tighter">Top Medicamentos</h3>
                  <p className="med-section-title mt-1">Más vendidos</p>
                </div>
                {topProducts.length > 0 && (
                  <div className="text-right med-section-title">Total {topProducts.length}</div>
                )}
              </div>
              <div className="h-64">
                {topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="medicamento" type="category" width={120} tick={{ fontSize: 11, fill: '#E8F0FE' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: '1px solid #2A3B56', borderRadius: '8px', color: '#E8F0FE' }} formatter={(value: number) => [value, 'Unidades']} />
                      <Bar dataKey="total_vendido" radius={[12, 12, 12, 12]}>
                        {topProducts.slice(0, 5).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={TOP_COLORS[index % TOP_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8CA3E6] text-sm">Datos no disponibles</div>
                )}
              </div>
              {topProducts.length > 0 && (
                <div className="mt-6 space-y-3">
                  {topProducts.slice(0, 3).map((product, index) => (
                    <div key={product.medicamento} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#24324A]">
                      <p className="med-section-title truncate">{index + 1}. {product.medicamento}</p>
                      <span className="text-sm font-black text-[#E8F0FE] shrink-0">{product.total_vendido}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="med-card-dark p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-[#E8F0FE] tracking-tighter">Estado de Inventario</h3>
                  <p className="med-section-title mt-1">Stock crítico vs disponible</p>
                </div>
                <div className="text-right med-section-title">Total {stats.total_medicamentos}</div>
              </div>
              <div className="h-64">
                {stockDistribution.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stockDistribution.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={80} paddingAngle={3} label={renderStockLabel} labelLine={false}>
                        {stockDistribution.filter(d => d.value > 0).map((entry, index) => {
                          const colors = ['#EF4444', '#F59E0B', '#19CF8D']
                          return <Cell key={`slice-${index}`} fill={colors[index]} />
                        })}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: '1px solid #2A3B56', borderRadius: '8px', color: '#E8F0FE' }} formatter={(value: number) => [value, 'Productos']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#8CA3E6] text-sm">Sin datos de inventario</div>
                )}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {stockDistribution.filter(d => d.value > 0 || stockDistribution.some(x => x.value > 0)).map((segment) => (
                  <div key={segment.name} className="p-3 rounded-2xl bg-[#24324A]">
                    <p className="med-section-title">{segment.name}</p>
                    <p className="text-sm font-black text-[#E8F0FE]">{segment.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 med-card-dark p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4EA0FC]/5 rounded-full -mr-32 -mt-32 blur-[100px]" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-xl font-black text-[#E8F0FE] tracking-tighter">Flujo de Caja</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#19CF8D] mt-1">Resumen del mes</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#19CF8D]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="bg-[#24324A] p-6 rounded-2xl">
                <p className="med-section-title mb-1">Ingresos del Mes</p>
                <p className="text-4xl font-black text-[#E8F0FE] tracking-tighter">{formatSoles(stats.ventas_mes)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#19CF8D] to-[#15B87C] p-6 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/80 mb-2">Meta de Ventas</p>
                <div className="h-1.5 bg-white/25 rounded-full mb-2">
                  <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (stats.ventas_mes / 2500) * 100)}%` }} />
                </div>
                <p className="text-right text-[8px] font-black uppercase tracking-widest text-white/70">
                  {formatSoles(stats.ventas_mes)} / S/ 2,500.00
                </p>
              </div>
            </div>
          </div>

          <div className="med-card-dark p-6 sm:p-8">
            <h3 className="text-lg font-black text-[#E8F0FE] tracking-tighter mb-6">Actividad</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#24324A]">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="med-section-title">Stock Crítico</p>
                  <p className="text-xs font-black text-[#E8F0FE]">{stats.stock_bajo} productos</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#24324A]">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="med-section-title">Agotados</p>
                  <p className="text-xs font-black text-[#E8F0FE]">{stats.agotados} productos</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#24324A]">
                <div className="w-8 h-8 rounded-lg bg-[#19CF8D]/15 text-[#19CF8D] flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <p className="med-section-title">Ventas Registradas</p>
                  <p className="text-xs font-black text-[#E8F0FE]">{stats.total_ventas} comprobantes</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#24324A]">
                <div className="w-8 h-8 rounded-lg bg-[#19CF8D]/15 text-[#19CF8D] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="med-section-title">Ingresos del Mes</p>
                  <p className="text-xs font-black text-[#E8F0FE]">{formatSoles(stats.ventas_mes)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
