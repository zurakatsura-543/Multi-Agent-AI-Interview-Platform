#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

services=(
  "services/auth"
  "services/resume"
  "services/interview"
  "services/roadmap"
  "services/billing"
  "gateway"
)

pids=()

cleanup() {
  echo
  echo "Stopping backend services..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}

trap cleanup EXIT INT TERM

for service in "${services[@]}"; do
  (
    cd "$ROOT_DIR/$service"
    echo "Starting $service"
    npm start
  ) &
  pids+=("$!")
done

wait
