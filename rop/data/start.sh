#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

if [ ! -f "/data/config.json" ]; then
    node /app/app/configure.js
fi

if [ -f "/data/config.json" ]; then
    node /app/app/app.js /data/config.json
fi

