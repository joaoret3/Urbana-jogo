@echo off
REM Abre o Urbana sem internet: inicia um servidor local e o navegador.
REM Precisa do Python instalado. Feche esta janela para encerrar o jogo.
cd /d "%~dp0"
start "" http://localhost:8000
python -m http.server 8000 || py -m http.server 8000
pause
