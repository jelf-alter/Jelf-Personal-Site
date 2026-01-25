# Port Cleanup Script
Write-Host "Cleaning up development ports..." -ForegroundColor Yellow

$ports = @(3000, 3001, 5173, 4173)

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Cyan
    
    $processes = netstat -ano | findstr ":$port "
    if ($processes) {
        Write-Host "Found processes on port $port" -ForegroundColor Red
        
        $processes | ForEach-Object {
            if ($_ -match '\s+(\d+)\s*$') {
                $pid = $matches[1]
                taskkill /PID $pid /F 2>$null
                Write-Host "  Killed process $pid" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  Port $port is free" -ForegroundColor Green
    }
}

Write-Host "Port cleanup complete!" -ForegroundColor Green