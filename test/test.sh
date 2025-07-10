#!/usr/bin/env bash
set -e
mkdir -p test
TEXT=$(cat test/sample.txt)

echo "Solicitando audio…"
curl -s -X POST "http://localhost:54321/functions/v1/tts" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"${TEXT}\", \"voice\": \"ef_dora\", \"speed\": 1.0}" \
  --output test/output.wav

echo "✅ Audio guardado en test/output.wav"
