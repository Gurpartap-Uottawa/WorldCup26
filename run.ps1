# World Cup 2026 Free Screenings Finder — Windows launcher
# Usage: .\run.ps1

$ErrorActionPreference = "Stop"

# ── Backend ──────────────────────────────────────────────────────────────────
Write-Host "Starting FastAPI backend on port 8000..." -ForegroundColor Cyan

Push-Location backend

if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

& .venv\Scripts\Activate.ps1
pip install -q -r requirements.txt

$backendProc = Start-Process -FilePath "uvicorn" -ArgumentList "main:app --reload --port 8000" -PassThru -NoNewWindow
Pop-Location

# ── Frontend ──────────────────────────────────────────────────────────────────
Write-Host "Starting Next.js frontend on port 3000..." -ForegroundColor Cyan

Push-Location frontend
npm install --silent
$frontendProc = Start-Process -FilePath "npm" -ArgumentList "run dev" -PassThru -NoNewWindow
Pop-Location

Write-Host ""
Write-Host "  World Cup 2026 Free Screenings Finder is running!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Gray

try {
    Wait-Process -Id $backendProc.Id, $frontendProc.Id
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $backendProc.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProc.Id -ErrorAction SilentlyContinue
}
