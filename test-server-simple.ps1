# Simple Server Test - Run individual commands
Write-Host "Copy and paste these commands one by one:" -ForegroundColor Green
Write-Host ""
Write-Host "# 1. Test health endpoint" -ForegroundColor Yellow
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET'
Write-Host ""
Write-Host "# 2. Test demos endpoint" -ForegroundColor Yellow  
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3001/api/demo" -Method GET'
Write-Host ""
Write-Host "# 3. Test datasets endpoint" -ForegroundColor Yellow
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3001/api/demo/elt/datasets" -Method GET'
Write-Host ""
Write-Host "# 4. Test WebSocket stats" -ForegroundColor Yellow
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3001/api/ws/stats" -Method GET'
Write-Host ""
Write-Host "# 5. Test pipeline execution" -ForegroundColor Yellow
Write-Host '$body = @{ datasetId = "sample-users"; config = @{} } | ConvertTo-Json'
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3001/api/demo/elt/execute" -Method POST -Body $body -ContentType "application/json"'
Write-Host ""
Write-Host "Make sure your server is running first: npm run dev:server" -ForegroundColor Red