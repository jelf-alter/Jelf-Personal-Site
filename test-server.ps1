# Server Verification Script
Write-Host "Testing Personal Website Server..." -ForegroundColor Green

$baseUrl = "http://localhost:3001"

# Test health endpoint
try {
    Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✓ Health check passed" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Cyan
    Write-Host "  Uptime: $($health.uptime) seconds" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test demos endpoint
try {
    Write-Host "`n2. Testing demos endpoint..." -ForegroundColor Yellow
    $demos = Invoke-RestMethod -Uri "$baseUrl/api/demo" -Method GET
    Write-Host "✓ Demos endpoint working" -ForegroundColor Green
    Write-Host "  Found $($demos.Count) demos" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Demos endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test datasets endpoint
try {
    Write-Host "`n3. Testing datasets endpoint..." -ForegroundColor Yellow
    $datasets = Invoke-RestMethod -Uri "$baseUrl/api/demo/elt/datasets" -Method GET
    Write-Host "✓ Datasets endpoint working" -ForegroundColor Green
    Write-Host "  Found $($datasets.Count) datasets" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Datasets endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test WebSocket stats
try {
    Write-Host "`n4. Testing WebSocket stats..." -ForegroundColor Yellow
    $wsStats = Invoke-RestMethod -Uri "$baseUrl/api/ws/stats" -Method GET
    Write-Host "✓ WebSocket stats working" -ForegroundColor Green
    Write-Host "  Active connections: $($wsStats.stats.activeConnections)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ WebSocket stats failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test pipeline execution (if datasets are available)
try {
    Write-Host "`n5. Testing ELT pipeline execution..." -ForegroundColor Yellow
    $body = @{
        datasetId = "sample-users"
        config = @{}
    } | ConvertTo-Json
    
    $execution = Invoke-RestMethod -Uri "$baseUrl/api/demo/elt/execute" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Pipeline execution working" -ForegroundColor Green
    Write-Host "  Execution ID: $($execution.id)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Pipeline execution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nServer verification complete!" -ForegroundColor Green
Write-Host "Make sure to start your server with: npm run dev:server" -ForegroundColor Yellow