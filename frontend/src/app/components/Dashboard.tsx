import { useState, useEffect } from 'react'
import { TrendingUp, Package, Users, DollarSign, AlertCircle, ShoppingCart, ArrowUpRight, ArrowDownRight, Activity, Calendar, Clock } from 'lucide-react'
import api from '../../api/axios'

export function Dashboard() {
  const [stats, setStats] = useState({ total_ventas: 0, total_medicamentos: 0, total_clientes: 0, ventas_mes: 0, stock_bajo: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [v, m, c] = await Promise.all([api.get('/ventas/comprobantes/'), api.get('/medicamentos/'), api.get('/clientes/')])
        const medData = m.data.results || m.data
        const lowStock = medData.filter((item: any) => (item.stock || 0) <= 10).length
        setStats({ total_ventas: v.data.count || v.data.length, total_medicamentos: medData.length, total_clientes: c.data.count || c.data.length, ventas_mes: 1240.50, stock_bajo: lowStock })
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  const cards = [
    { title: 'Ventas', value: stats.total_ventas, icon: ShoppingCart, color: 'emerald' },
    { title: 'Productos', value: stats.total_medicamentos, icon: Package, color: 'blue' },
    { title: 'Clientes', value: stats.total_clientes, icon: Users, color: 'purple' },
    { title: 'Stock Bajo', value: stats.stock_bajo, icon: AlertCircle, color: 'red' }
  ]

  return (
    <div className="h-full bg-slate-100 p-6 sm:p-8 overflow-y-auto no-scrollbar" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <div className="max-w-screen-2xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-black text-slate-900 tracking-tighter">Panel de Control</h1><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2"><Activity className="w-3 h-3 text-emerald-500" /> Rendimiento en vivo</p></div>
          <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"><Calendar className="w-4 h-4 text-slate-300" /><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <div key={i} className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl bg-${c.color}-50 flex items-center justify-center text-${c.color}-600`}><c.icon className="w-5 h-5" /></div>
                <ArrowUpRight className="w-3 h-3 text-slate-200" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{c.title}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{c.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
            <div className="flex items-center justify-between mb-8 relative z-10"><div><h2 className="text-xl font-black tracking-tighter">Flujo de Caja</h2><p className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-400 mt-1">Estimado del mes</p></div><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="bg-white/5 p-6 rounded-[24px] border border-white/10"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Ingresos Hoy</p><p className="text-4xl font-black tracking-tighter">S/ {stats.ventas_mes.toFixed(2)}</p></div>
              <div className="bg-emerald-600 p-6 rounded-[24px] shadow-lg shadow-emerald-500/20"><p className="text-[9px] font-black uppercase tracking-widest text-emerald-100 mb-2">Meta de Ventas</p><div className="h-1.5 bg-white/20 rounded-full mb-2"><div className="h-full bg-white rounded-full w-[75%]" /></div><p className="text-right text-[8px] font-black uppercase tracking-widest">S/ 2,500.00</p></div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 tracking-tighter mb-6">Actividad</h3>
            <div className="space-y-4">
              {[ { l: 'Stock Crítico', v: stats.stock_bajo, i: AlertCircle, c: 'red' }, { l: 'Nuevas Ventas', v: stats.total_ventas, i: ShoppingBag, c: 'emerald' }, { l: 'Última Carga', v: 'Hace 2m', i: Clock, c: 'blue' } ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50">
                  <div className={`w-8 h-8 rounded-lg bg-${item.c}-50 flex items-center justify-center text-${item.c}-600`}><item.i className="w-4 h-4" /></div>
                  <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.l}</p><p className="text-xs font-black text-slate-900">{item.v}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  )
}
const ShoppingBag = ({className}: {className?: string}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
