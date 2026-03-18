#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")" && pwd)"

for f in "$ROOT/.backend.pid" "$ROOT/.frontend.pid"; do
  if [ -f "$f" ]; then
    PID=$(cat "$f")
    kill "$PID" 2>/dev/null && echo "Stoppet PID $PID" || echo "Prosess $PID var ikke aktiv"
    rm -f "$f"
  fi
done

# Drep eventuelle gjenværende prosesser på portene
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "Pokerade stoppet."
