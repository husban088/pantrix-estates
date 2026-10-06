@echo off
cd /d "%~dp0python-valuation"
pip install -r requirements.txt
python app.py
pause
