# Start Local Dev Server Script
Write-Host "Starting local development server..." -ForegroundColor Green

# Try to find npm in common locations
$npmPaths = @(
    "C:\Program Files\nodejs\npm.cmd",
    "C:\Program Files (x86)\nodejs\npm.cmd",
    "$env:APPDATA\npm\npm.cmd",
    "$env:LOCALAPPDATA\Programs\nodejs\npm.cmd"
)

$npmPath = $null
foreach ($path in $npmPaths) {
    if (Test-Path $path) {
        $npmPath = $path
        Write-Host "Found npm at: $npmPath" -ForegroundColor Yellow
        break
    }
}

if (-not $npmPath) {
    # Try to find npm in PATH
    $npmPath = Get-Command npm -ErrorAction SilentlyContinue
    if ($npmPath) {
        $npmPath = $npmPath.Source
        Write-Host "Found npm in PATH: $npmPath" -ForegroundColor Yellow
    }
}

if (-not $npmPath) {
    Write-Host "`nERROR: npm not found!" -ForegroundColor Red
    Write-Host "`nPlease install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Or run 'npm run dev' manually if Node.js is installed." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nInstalling dependencies (if needed)..." -ForegroundColor Cyan
& $npmPath install

Write-Host "`nStarting dev server..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

& $npmPath run dev

