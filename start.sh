#!/bin/bash
set -e
python3 -m pip install -r backend/requirements.txt
cd backend
exec python3 -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
