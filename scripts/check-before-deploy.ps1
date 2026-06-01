# Helper: check git status before GitHub push
# Run from office-meal-app folder:  .\scripts\check-before-deploy.ps1

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "=== Office Meal App — pre-deploy check ===" -ForegroundColor Cyan
Write-Host ""

# Node
try {
  $node = node -v
  Write-Host "[OK] Node $node" -ForegroundColor Green
} catch {
  Write-Host "[FAIL] Node.js not installed" -ForegroundColor Red
}

# Build
Write-Host "Running production build (may take 1 min)..." -ForegroundColor Yellow
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
  Write-Host "[OK] npm run build succeeded" -ForegroundColor Green
} else {
  Write-Host "[FAIL] Build failed — fix errors before deploy" -ForegroundColor Red
}

# Git
if (Test-Path ".git") {
  Write-Host "[OK] Git repo exists" -ForegroundColor Green
  git status -sb
} else {
  Write-Host "[INFO] No git repo yet — run:" -ForegroundColor Yellow
  Write-Host "  git init"
  Write-Host "  git add ."
  Write-Host "  git commit -m `"Office meal app`""
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Create GitHub repo: https://github.com/new"
Write-Host "  2. git remote add origin https://github.com/YOU/office-meal-app.git"
Write-Host "  3. git push -u origin main"
Write-Host "  4. Render.com -> New Blueprint -> select repo"
Write-Host ""
Write-Host "Guide: docs/DEPLOY-RENDER.md" -ForegroundColor Green
