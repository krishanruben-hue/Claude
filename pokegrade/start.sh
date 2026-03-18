#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==================================="
echo "  PokeGrade – starter opp..."
echo "==================================="

# Installer backend-avhengigheter om noedvendig
if [ ! -d "backend/node_modules" ]; then
  echo "[1/3] Installerer backend-pakker..."
  cd backend && npm install && cd ..
fi

# Installer Playwright-nettlesere om noedvendig
if [ ! -d "$HOME/.cache/ms-playwright" ] && [ ! -d "$HOME/Library/Caches/ms-playwright" ]; then
  echo "[2/3] Installerer Playwright-nettleser (Chromium)..."
  cd backend && npx playwright install chromium && cd ..
fi

# Installer frontend-avhengigheter om noedvendig
if [ ! -d "frontend/node_modules" ]; then
  echo "[3/3] Installerer frontend-pakker..."
  cd frontend && npm install && cd ..
fi

# Lag .env om den ikke finnes
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo ""
  echo "MERK: backend/.env ble opprettet fra .env.example"
  echo "Appen kjorer i DEMO-MODUS med eksempeldata."
  echo "Legg inn API-noekler i backend/.env for live-data."
  echo ""
fi

echo ""
echo "Starter backend pa port 3001..."
cd backend && node index.js &
BACKEND_PID=$!

sleep 2

echo "Starter frontend pa port 5173..."
cd "$SCRIPT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!

sleep 2

# Aapne nettleser
echo ""
echo "Aapner PokeGrade i nettleseren..."
if command -v open &> /dev/null; then
  open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:5173
fi

echo ""
echo "PokeGrade kjorer pa http://localhost:5173"
echo "Trykk Ctrl+C for aa stoppe."
echo ""

# Vent pa begge prosesser
wait $BACKEND_PID $FRONTEND_PID
