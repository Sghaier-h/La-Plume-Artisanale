# Libere les ports 5000 (backend) et 3000 (frontend)
# Executez ce script si "port deja utilise" au demarrage.

$ports = 5000, 3000
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
        Write-Host "Port $port -> arret PID: $($pids -join ', ')" -ForegroundColor Yellow
        foreach ($procId in $pids) {
            if ($procId -gt 0) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }
        }
    } else {
        Write-Host "Port $port deja libre." -ForegroundColor Green
    }
}
Write-Host "Termine. Vous pouvez relancer LANCER_LOCAL.ps1" -ForegroundColor Green
