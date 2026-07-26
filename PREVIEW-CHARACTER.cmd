@echo off
title Masood Salik 3D Character Lab
cd /d "%~dp0"
echo.
echo Character lab is running at:
echo http://127.0.0.1:4180
echo.
echo Keep this window open while reviewing the character.
echo Press Ctrl+C to stop.
echo.
python -m http.server 4180 --bind 127.0.0.1
