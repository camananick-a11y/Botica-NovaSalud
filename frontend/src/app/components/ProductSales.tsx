import { useState, useEffect, useMemo } from 'react'
import { Search, TrendingUp, Calendar, Loader2, AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Pill } from 'lucide-react'
import api from '../../api/axios'

type SortKey = 'nombre' | 'presentacion' | 'total_vendido' | 'total_recaudado'
type SortDir = 'asc' | 'desc'

export function ProductSales() {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const firstDayStr = firstDay.toISOString().split('T')[0]
  const lastDayStr = lastDay.toISOString().split('T')[0]

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total_vendido')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState(firstDayStr)
  const [endDate, setEndDate] = useState(lastDayStr)
  const [appliedStart, setAppliedStart] = useState(firstDayStr)
  const [appliedEnd, setAppliedEnd] = useState(lastDayStr)
  const pageSize = 20

  const fetchData = (allTime = false) => {
    setLoading(true)
    setError(null)
    const params: Record<string, string> = {}
    if (!allTime) {
      params.inicio = appliedStart
      params.fin = appliedEnd
    }
    api.get('/ventas/comprobantes/todos_vendidos/', { params })
      .then(({ data: res }) => {
        setData(Array.isArray(res) ? res : res.results || [])
        setPage(1)
      })
      .catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'nombre' || key === 'presentacion' ? 'asc' : 'desc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 text-[#5F7FB8]" />
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-[#4EA0FC]" />
      : <ArrowDown className="w-3 h-3 text-[#4EA0FC]" />
  }

  const filtered = useMemo(() => {
    let result = [...data]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        (r.id_medicamento__nombre || '').toLowerCase().includes(q) ||
        (r.id_medicamento__id_presentacion__nombre || '').toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      let cmp = 0
      const aVal = a[sortKey === 'nombre' ? 'id_medicamento__nombre' : sortKey === 'presentacion' ? 'id_medicamento__id_presentacion__nombre' : sortKey]
      const bVal = b[sortKey === 'nombre' ? 'id_medicamento__nombre' : sortKey === 'presentacion' ? 'id_medicamento__id_presentacion__nombre' : sortKey]
      if (typeof aVal === 'string') cmp = aVal.localeCompare(bVal)
      else cmp = (Number(aVal) || 0) - (Number(bVal) || 0)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [data, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalRecaudado = filtered.reduce((s, r) => s + (Number(r.total_recaudado) || 0), 0)
  const totalVendido = filtered.reduce((s, r) => s + (Number(r.total_vendido) || 0), 0)

  return (
    <div className="h-full bg-background p-6 sm:p-8 overflow-y-auto scrollbar-thin">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4EA0FC]/10 border border-[#4EA0FC]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#4EA0FC]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#E8F0FE] tracking-tight">Productos Vendidos</h1>
              <p className="text-[10px] font-medium text-[#8CA3E6]">Reporte de ventas por producto</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 med-card-dark px-3 py-2">
              <Calendar className="w-4 h-4 text-[#8CA3E6]" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-[#E8F0FE] outline-none w-[110px] [color-scheme:dark]" />
              <span className="text-[#5F7FB8] text-[10px]">→</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-[#E8F0FE] outline-none w-[110px] [color-scheme:dark]" />
            </div>
            <button onClick={() => { setAppliedStart(startDate); setAppliedEnd(endDate); fetchData() }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4EA0FC] hover:bg-[#3B82F6] transition-all text-white text-[10px] font-black uppercase tracking-widest">
              <Search className="w-3.5 h-3.5" /> Filtrar
            </button>
            <button onClick={() => { setStartDate(''); setEndDate(''); setAppliedStart(''); setAppliedEnd(''); fetchData(true) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#24324A] hover:bg-[#2A3B56] transition-all text-[#8CA3E6] text-[10px] font-black uppercase tracking-widest border border-[#2A3B56]">
              <RefreshCw className="w-3.5 h-3.5" /> Desde siempre
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F7FB8]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..." className="med-input pl-9" />
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[#8CA3E6]">
            <span><strong className="text-[#E8F0FE]">{filtered.length}</strong> productos</span>
            <span><strong className="text-[#E8F0FE]">{totalVendido}</strong> unidades</span>
            <span><strong className="text-[#19CF8D]">S/ {totalRecaudado.toFixed(2)}</strong> recaudado</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#4EA0FC] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-10 h-10 text-[#EF4444]" />
            <p className="text-sm text-[#EF4444]">{error}</p>
            <button onClick={() => fetchData()} className="med-btn-primary text-xs px-4 py-2">Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#8CA3E6]">No hay datos para el período seleccionado</p>
          </div>
        ) : (
          <div className="med-card-dark overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#2A3B56]">
                    <th className="px-4 py-3 text-[9px] font-black text-[#8CA3E6] uppercase tracking-widest">#</th>
                    <th className="px-4 py-3 text-[9px] font-black text-[#8CA3E6] uppercase tracking-widest">Foto</th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort('nombre')} className="flex items-center gap-1.5 text-[9px] font-black text-[#8CA3E6] uppercase tracking-widest hover:text-[#E8F0FE] transition-colors">
                        Producto <SortIcon column="nombre" />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort('presentacion')} className="flex items-center gap-1.5 text-[9px] font-black text-[#8CA3E6] uppercase tracking-widest hover:text-[#E8F0FE] transition-colors">
                        Presentación <SortIcon column="presentacion" />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort('total_vendido')} className="flex items-center gap-1.5 text-[9px] font-black text-[#8CA3E6] uppercase tracking-widest hover:text-[#E8F0FE] transition-colors">
                        Cant. Vendida <SortIcon column="total_vendido" />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort('total_recaudado')} className="flex items-center gap-1.5 text-[9px] font-black text-[#8CA3E6] uppercase tracking-widest hover:text-[#E8F0FE] transition-colors">
                        Total Recaudado <SortIcon column="total_recaudado" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row, i) => (
                    <tr key={row.id_medicamento} className="border-b border-[#2A3B56]/50 hover:bg-[#24324A] transition-colors">
                      <td className="px-4 py-3.5 text-[10px] font-medium text-[#5F7FB8]">{(page - 1) * pageSize + i + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#2A3B56] bg-[#24324A]">
                          {row.id_medicamento__imagen_url ? (
                            <img src={row.id_medicamento__imagen_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#5F7FB8]">
                              <Pill className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-[#E8F0FE]">{row.id_medicamento__nombre || '-'}</td>
                      <td className="px-4 py-3.5 text-[10px] text-[#B5CEFF]">{row.id_medicamento__id_presentacion__nombre || '-'}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-[#E8F0FE]">{row.total_vendido}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-[#19CF8D]">S/ {Number(row.total_recaudado).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-4 border-t border-[#2A3B56]">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg bg-[#24324A] border border-[#2A3B56] text-[#8CA3E6] hover:text-[#E8F0FE] disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-[#8CA3E6]">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg bg-[#24324A] border border-[#2A3B56] text-[#8CA3E6] hover:text-[#E8F0FE] disabled:opacity-30 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}