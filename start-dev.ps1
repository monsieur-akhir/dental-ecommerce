# Script PowerShell pour démarrer le backend et le frontend en mode développement

Write-Host "🚀 Démarrage des services en mode développement..." -ForegroundColor Green

# Fonction pour arrêter les processus
function Stop-Services {
    Write-Host "🛑 Arrêt des services..." -ForegroundColor Yellow
    if ($backendJob) { Stop-Job $backendJob; Remove-Job $backendJob }
    if ($frontendJob) { Stop-Job $frontendJob; Remove-Job $frontendJob }
    exit 0
}

# Capturer Ctrl+C
Register-EngineEvent PowerShell.Exiting -Action { Stop-Services }

try {
    # Démarrer le backend
    Write-Host "📦 Démarrage du backend sur le port 3000..." -ForegroundColor Cyan
    $backendJob = Start-Job -ScriptBlock {
        Set-Location "backend"
        npm run start:dev
    }

    # Attendre un peu que le backend démarre
    Start-Sleep -Seconds 5

    # Démarrer le frontend
    Write-Host "⚛️  Démarrage du frontend sur le port 3001..." -ForegroundColor Cyan
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "frontend"
        $env:PORT = "3001"
        npm start
    }

    Write-Host "✅ Services démarrés !" -ForegroundColor Green
    Write-Host "📱 Frontend: http://localhost:3001" -ForegroundColor White
    Write-Host "🔧 Backend: http://localhost:3000" -ForegroundColor White
    Write-Host "📚 API Docs: http://localhost:3000/api/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Appuyez sur Ctrl+C pour arrêter les services" -ForegroundColor Yellow

    # Surveiller les jobs
    while ($true) {
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "❌ Un service a échoué" -ForegroundColor Red
            break
        }
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "❌ Erreur lors du démarrage: $_" -ForegroundColor Red
}
finally {
    Stop-Services
} 