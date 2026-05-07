#!/bin/sh
set -eu

echo "Entrypoint: starting SoumiTaw backend"
echo "Entrypoint: environment=${ENVIRONMENT:-unknown} port=${PORT:-8000}"
echo "Entrypoint: running bootstrap"
python -m app.bootstrap
echo "Entrypoint: bootstrap finished"
echo "Entrypoint: starting uvicorn"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
