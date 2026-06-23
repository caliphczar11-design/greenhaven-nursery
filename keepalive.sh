#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting server at $(date)"
  npx next dev -p 3000
  echo "Server exited, restarting in 3s..."
  sleep 3
done
