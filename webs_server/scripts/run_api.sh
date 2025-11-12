#!/bin/bash

HOST=${HOST:-0.0.0.0}
PORT=${PORT:-8080}
WORKERS=${WORKERS:-4}
LOG_LEVEL=${LOG_LEVEL:-info}
KEEP_ALIVE=${KEEP_ALIVE:-30}

exec uvicorn server:app \
    --host $HOST \
    --port $PORT \
    --workers $WORKERS \
    --log-level $LOG_LEVEL \
    --no-access-log \
    --timeout-keep-alive $KEEP_ALIVE \
