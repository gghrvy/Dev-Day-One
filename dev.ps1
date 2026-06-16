# Start backend and frontend in VS Code integrated terminal splits
$root = $PSScriptRoot

# Backend
$backendCmd = "cd '$root\backend'; .venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8000"

# Frontend
$frontendCmd = "cd '$root\frontend'; npm run dev"

# Open both in new VS Code terminals
code --command workbench.action.terminal.newWithCwd "$root\backend"
Start-Sleep -Milliseconds 500
code --command workbench.action.terminal.newWithCwd "$root\frontend"
