#!/usr/bin/env bash
# Pokerade – start backend + frontend og åpne nettleseren
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID_FILE="$ROOT/.backend.pid"
FRONTEND_PID_FILE="$ROOT/.frontend.pid"

# Farger
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting Pokerade...${NC}"

# ── Backend ───────────────────────────────────────────────────────────────────
if [ ! -d "$ROOT/server/node_modules" ]; then
  echo -e "${YELLOW}Installerer backend-avhengigheter...${NC}"
  cd "$ROOT/server" && npm install
fi

echo "Starter backend (port 3001)..."
cd "$ROOT/server"
npm start > "$ROOT/.backend.log" 2>&1 &
echo $! > "$BACKEND_PID_FILE"

# Vent til backend svarer
for i in {1..20}; do
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}Backend oppe!${NC}"
    break
  fi
  sleep 1
done

# ── Frontend ──────────────────────────────────────────────────────────────────
if [ ! -d "$ROOT/node_modules" ]; then
  echo -e "${YELLOW}Installerer frontend-avhengigheter...${NC}"
  cd "$ROOT" && npm install
fi

echo "Starter frontend (port 5173)..."
cd "$ROOT"
npm run dev > "$ROOT/.frontend.log" 2>&1 &
echo $! > "$FRONTEND_PID_FILE"

# Vent og åpne nettleser
sleep 3
echo -e "${GREEN}Åpner http://localhost:5173 i nettleseren...${NC}"
open "http://localhost:5173" 2>/dev/null || xdg-open "http://localhost:5173" 2>/dev/null || true

echo ""
echo -e "${GREEN}Pokerade kjører!${NC}"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:3001"
echo "  Data:      ~/.pokerade/pokerade.db"
echo ""
echo "Trykk Ctrl+C for å stoppe."

# Hold prosessene i gang og håndter Ctrl+C
trap "echo 'Stopper...'; kill \$(cat $BACKEND_PID_FILE) \$(cat $FRONTEND_PID_FILE) 2>/dev/null; rm -f $BACKEND_PID_FILE $FRONTEND_PID_FILE; exit 0" INT TERM

wait
