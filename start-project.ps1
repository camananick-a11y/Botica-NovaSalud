# Script para iniciar Botica Nova Salud
# Ejecuta: .\start-project.ps1

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     BOTICA NOVA SALUD - Sistema de Ventas             ║" -ForegroundColor Cyan
Write-Host "║     Iniciando Backend (Django) y Frontend (React)     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Detectar si estamos en el directorio correcto
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "ERROR: Debes estar en la raíz del proyecto (donde están las carpetas 'backend' y 'frontend')" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Directorio de trabajo: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Preguntar qué deseas iniciar
Write-Host "¿Qué deseas iniciar?" -ForegroundColor Cyan
Write-Host "  1. Solo Backend" -ForegroundColor White
Write-Host "  2. Solo Frontend" -ForegroundColor White
Write-Host "  3. Backend y Frontend (en 2 terminals)" -ForegroundColor White
Write-Host ""

$opcion = Read-Host "Selecciona una opción (1, 2 o 3)"

switch ($opcion) {
    "1" {
        Write-Host "`n🚀 Iniciando BACKEND (Django)..." -ForegroundColor Green
        cd backend
        .\venv\Scripts\Activate.ps1
        Write-Host "✅ Entorno virtual activado" -ForegroundColor Green
        Write-Host ""
        Write-Host "Iniciando servidor Django en http://localhost:8000" -ForegroundColor Cyan
        Write-Host "Panel Admin: http://localhost:8000/admin" -ForegroundColor Cyan
        Write-Host "Usuario: admin | Contraseña: admin123" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
        python manage.py runserver
    }
    
    "2" {
        Write-Host "`n🚀 Iniciando FRONTEND (React)..." -ForegroundColor Green
        cd frontend
        Write-Host "✅ Instalando dependencias si es necesario..." -ForegroundColor Green
        if (-not (Test-Path "node_modules")) {
            npm install
        }
        Write-Host ""
        Write-Host "Iniciando servidor Vite en http://localhost:5173" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
        npm run dev
    }
    
    "3" {
        Write-Host "`n🚀 Iniciando BACKEND y FRONTEND..." -ForegroundColor Green
        Write-Host ""
        
        # Iniciar Backend
        Write-Host "1️⃣  Abriendo Backend (Django)..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\venv\Scripts\Activate.ps1; Write-Host 'Iniciando Django...' -ForegroundColor Green; python manage.py runserver"
        
        Start-Sleep -Seconds 3
        
        # Iniciar Frontend
        Write-Host "2️⃣  Abriendo Frontend (React)..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; if (-not (Test-Path 'node_modules')) { npm install }; Write-Host 'Iniciando Vite...' -ForegroundColor Green; npm run dev"
        
        Write-Host ""
        Write-Host "✅ ¡Ambos servidores iniciados en nuevas ventanas!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Accede a:" -ForegroundColor Cyan
        Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
        Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
        Write-Host "   Admin:     http://localhost:8000/admin" -ForegroundColor White
        Write-Host ""
        Write-Host "Presiona Enter para cerrar esta ventana..." -ForegroundColor Yellow
        Read-Host
    }
    
    default {
        Write-Host "Opción no válida" -ForegroundColor Red
        exit 1
    }
}
