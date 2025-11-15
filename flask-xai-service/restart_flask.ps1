# Stop any existing Flask processes
Write-Host "`n🛑 Stopping existing Flask processes..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*flask-xai-service*" -or $_.CommandLine -like "*app.py*"} | Stop-Process -Force
Start-Sleep -Seconds 2

# Start Flask service
Write-Host "`n🚀 Starting Flask XAI service..." -ForegroundColor Green
Set-Location "D:\Projects\BloodReportAnalysisXAI\flask-xai-service"
Start-Process python -ArgumentList "app.py" -NoNewWindow

Write-Host "`n✅ Flask service restarted!" -ForegroundColor Green
Write-Host "   API available at: http://localhost:5001" -ForegroundColor Cyan
Write-Host "`n📝 Monitor logs in the terminal to verify the fix..." -ForegroundColor Yellow
