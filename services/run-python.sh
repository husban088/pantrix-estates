#!/bin/sh
cd "$(dirname "$0")/python-valuation" || exit 1
python3 -m pip install -r requirements.txt
python3 app.py
