#!/bin/sh
# Abre o Urbana sem internet: inicia um servidor local e o navegador.
cd "$(dirname "$0")"
(sleep 1; xdg-open http://localhost:8000 2>/dev/null || open http://localhost:8000) &
python3 -m http.server 8000
