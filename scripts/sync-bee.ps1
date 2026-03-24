# sync-bee.ps1
# Automates the daily sync of Bee notes to a local directory.

$OutputDir = "D:\Bee-Notes"
$LogFile = "D:\Bee-Notes\sync-log.txt"

# Ensure the output directory exists
if (-not (Test-Path -Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Get timestamp for logging
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    Write-Host "[$Timestamp] Starting Bee sync..."
    # Run the bee sync command
    $Result = & bee sync --output $OutputDir 2>&1

    # Check if the command was successful
    if ($LASTEXITCODE -eq 0) {
        "[$Timestamp] SUCCESS: Bee sync completed.`n$Result" | Out-File -FilePath $LogFile -Append
        Write-Host "[$Timestamp] Success! Notes saved to $OutputDir"
    } else {
        throw "Bee sync failed with exit code $LASTEXITCODE. Output: $Result"
    }
} catch {
    $ErrorMsg = "[$Timestamp] ERROR: " + $_.Exception.Message
    $ErrorMsg | Out-File -FilePath $LogFile -Append
    Write-Error $ErrorMsg
}

