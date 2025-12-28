# Auto-install Node.js Script
# Requires Administrator rights

Write-Host "=== Автоматическая установка Node.js ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Требуются права администратора!" -ForegroundColor Yellow
    Write-Host "Запустите PowerShell от имени администратора и выполните:" -ForegroundColor Yellow
    Write-Host "  Set-ExecutionPolicy Bypass -Scope Process -Force" -ForegroundColor White
    Write-Host "  .\auto_install_node.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Или установите Node.js вручную: https://nodejs.org/" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Права администратора подтверждены" -ForegroundColor Green
Write-Host ""

# Download Node.js LTS
$nodeVersion = "20.11.0"  # LTS version
$nodeUrl = "https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-x64.msi"
$downloadPath = "$env:TEMP\nodejs-installer.msi"

Write-Host "📥 Скачивание Node.js LTS v${nodeVersion}..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $nodeUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "✅ Скачивание завершено" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка скачивания: $_" -ForegroundColor Red
    Write-Host "Попробуйте установить вручную: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Установка Node.js..." -ForegroundColor Cyan
Write-Host "Следуйте инструкциям установщика (выберите 'Add to PATH')" -ForegroundColor Yellow
Write-Host ""

# Run installer
Start-Process msiexec.exe -ArgumentList "/i `"$downloadPath`" /quiet /norestart ADDLOCAL=ALL" -Wait

Write-Host ""
Write-Host "🔄 Обновление PATH..." -ForegroundColor Cyan
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify installation
Start-Sleep -Seconds 2
$nodePath = Get-Command node -ErrorAction SilentlyContinue
$npmPath = Get-Command npm -ErrorAction SilentlyContinue

if ($nodePath -and $npmPath) {
    Write-Host "✅ Node.js установлен успешно!" -ForegroundColor Green
    Write-Host "Node: $($nodePath.Source)" -ForegroundColor White
    Write-Host "npm: $($npmPath.Source)" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  ВАЖНО: Перезапустите терминал для применения изменений PATH" -ForegroundColor Yellow
    Write-Host "Затем выполните: npm install && npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Установка завершена, но Node.js не найден в PATH" -ForegroundColor Yellow
    Write-Host "Перезапустите терминал или установите вручную: https://nodejs.org/" -ForegroundColor Yellow
}

# Cleanup
Remove-Item $downloadPath -ErrorAction SilentlyContinue

