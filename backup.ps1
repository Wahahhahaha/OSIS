# Get timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $PSScriptRoot "backups"
$backupFile = "osis_backup_$timestamp.sql"
$containerPath = "/tmp/$backupFile"
$localPath = Join-Path $backupDir $backupFile

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "Starting backup of database 'osis' from docker container 'osis-postgres'..." -ForegroundColor Cyan

# Run pg_dump inside container
docker exec osis-postgres pg_dump -U postgres -d osis -f $containerPath
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create backup inside the container."
    exit $LASTEXITCODE
}

# Copy from container to host
docker cp "osis-postgres:$containerPath" $localPath
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to copy backup file from container to host."
    exit $LASTEXITCODE
}

# Remove temporary file inside container
docker exec osis-postgres rm $containerPath

Write-Host "Backup successfully saved to: $localPath" -ForegroundColor Green
