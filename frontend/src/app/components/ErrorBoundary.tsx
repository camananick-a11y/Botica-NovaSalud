import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="h-full flex items-center justify-center bg-background p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#E8F0FE] mb-2">Algo salió mal</h2>
            <p className="text-sm text-[#8CA3E6] mb-4">{this.state.error?.message || 'Error inesperado'}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}
              className="med-btn-primary text-sm">Reintentar</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
