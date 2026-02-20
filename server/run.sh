#!/bin/bash
# Start the worker in the background
python -m app.jobs.worker &

# Start the API in the foreground
# Render will monitor this process. If it dies, the container restarts.
uvicorn app.main:app --host 0.0.0.0 --port 10000