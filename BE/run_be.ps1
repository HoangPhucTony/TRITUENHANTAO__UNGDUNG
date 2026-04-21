# SmartStay AI - Start Backend
Write-Host "Starting SmartStay AI Backend..." -ForegroundColor Cyan

$pythonCommand = Get-Command py -ErrorAction SilentlyContinue
$pythonArgs = @()

function Test-PythonLauncher {
    param(
        [string]$Executable,
        [string[]]$Arguments = @()
    )

    & $Executable @Arguments -c "import uvicorn" *> $null
    return $LASTEXITCODE -eq 0
}

if ((Get-Command python -ErrorAction SilentlyContinue) -and (Test-PythonLauncher -Executable "python")) {
    $pythonExe = "python"
} elseif ($pythonCommand -and (Test-PythonLauncher -Executable "py" -Arguments @("-3.13"))) {
    $pythonExe = "py"
    $pythonArgs = @("-3.13")
} elseif ($pythonCommand -and (Test-PythonLauncher -Executable "py" -Arguments @("-3"))) {
    $pythonExe = "py"
    $pythonArgs = @("-3")
} else {
    Write-Error "No Python interpreter with uvicorn installed was found. Run python -m pip install -r requirements.txt or activate the correct environment first."
    exit 1
}

Write-Host "Using Python launcher: $pythonExe" -ForegroundColor DarkGray
& $pythonExe @pythonArgs -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
