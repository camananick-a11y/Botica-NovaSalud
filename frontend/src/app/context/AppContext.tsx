import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../../api/axios'

export type UserRole = 'Administrador' | 'Vendedor' | 'Almacenero' | 'Supervisor'

export interface CurrentUser {
  id: number
  name: string
  role: UserRole
  email: string
  avatar: string
  color: string
  imagen_url: string | null
}

interface AppCtxType {
  user: CurrentUser | null
  login: (username: string, password: string, expectedRole: string) => Promise<void>
  logout: () => void
  loading: boolean
  updateProfile: (data: FormData | Record<string, any>) => Promise<void>
  highlightedProductId: number | null
  setHighlightedProductId: (id: number | null) => void
}

const ROLE_MAP: Record<string, UserRole> = {
  Administrador: 'Administrador',
  Vendedor: 'Vendedor',
  Almacenero: 'Almacenero',
  Supervisor: 'Supervisor',
}

const ROLE_COLORS: Record<string, string> = {
  Administrador: '#7C3AED',
  Vendedor: '#059669',
  Almacenero: '#2563EB',
  Supervisor: '#D97706',
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const AppCtx = createContext<AppCtxType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [highlightedProductId, setHighlightedProductId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/auth/usuarios/me/')
        .then(({ data }) => {
          const role = ROLE_MAP[data.cargo_nombre] || 'Vendedor'
          setUser({
            id: data.id_usuario,
            name: data.nombre,
            role,
            email: data.usuario + '@novasalud.pe',
            avatar: getInitials(data.nombre),
            color: ROLE_COLORS[role],
            imagen_url: data.imagen_url || null,
          })
        })
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string, expectedRole: string) => {
    const { data } = await api.post('/token/', { usuario: username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)

    const me = await api.get('/auth/usuarios/me/')

    if (me.data.cargo_nombre !== expectedRole) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      throw { response: { data: { error: `Este usuario no es ${expectedRole}. Selecciona el rol correcto.` } } }
    }

    const role = ROLE_MAP[me.data.cargo_nombre] || 'Vendedor'
    setUser({
      id: me.data.id_usuario,
      name: me.data.nombre,
      role,
      email: me.data.usuario + '@novasalud.pe',
      avatar: getInitials(me.data.nombre),
      color: ROLE_COLORS[role],
      imagen_url: me.data.imagen_url || null,
    })
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const refreshUser = () => {
    api.get('/auth/usuarios/me/')
      .then(({ data }) => {
        const role = ROLE_MAP[data.cargo_nombre] || 'Vendedor'
        setUser({
          id: data.id_usuario,
          name: data.nombre,
          role,
          email: data.usuario + '@novasalud.pe',
          avatar: getInitials(data.nombre),
          color: ROLE_COLORS[role],
          imagen_url: data.imagen_url || null,
        })
      })
      .catch(() => {})
  }

  const updateProfile = async (data: FormData | Record<string, any>) => {
    await api.patch('/auth/usuarios/perfil/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
    refreshUser()
  }

  return (
    <AppCtx.Provider value={{ user, login, logout, loading, updateProfile, highlightedProductId, setHighlightedProductId }}>
      {children}
    </AppCtx.Provider>
  )
}

export function useApp(): AppCtxType {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
