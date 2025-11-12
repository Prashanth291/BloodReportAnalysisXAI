# Helper PowerShell script to activate venv and run the Flask XAI app
# Usage: ./run_flask.ps1

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$venvPython = "D:/Projects/BloodReportAnalysisXAI/.venv/Scripts/python.exe"
if (-Not (Test-Path $venvPython)) {
    Write-Host "Virtual environment python not found at $venvPython" -ForegroundColor Yellow
    Write-Host "Activate your venv or update the path in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Using venv python: $venvPython"
Write-Host "Installing requirements (if any missing)..."
& $venvPython -m pip install -r requirements.txt

Write-Host "Starting Flask XAI app..."
& $venvPython app.py
