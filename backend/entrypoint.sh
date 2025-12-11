#!/bin/bash
set -e

## Minimal entrypoint
# Behavior:
# - perform a short DB readiness probe using bash's built-in TCP (10 attempts, 1s apart)
# - do NOT run long waits or try building/migrating here (keeps entrypoint simple as requested).
# - locate and run the built file; prefer dist/src/main.js, then dist/main.js, then dist/index.js.

DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
TRY_COUNT=20
WAIT_SECS=1

echo "Probing DB at ${DB_HOST}:${DB_PORT} (up to ${TRY_COUNT} attempts)"
success=0
i=0
while [ $i -lt $TRY_COUNT ]; do
  i=$((i+1))
  # Use bash TCP redirect: try to open connection, redirect to /dev/null
  if (echo > /dev/tcp/"$DB_HOST"/"$DB_PORT") 2>/dev/null; then
    echo "✓ DB is reachable on ${DB_HOST}:${DB_PORT} (attempt $i)"
    success=1
    break
  fi
  if [ $i -lt $TRY_COUNT ]; then
    echo "  [attempt $i/$TRY_COUNT] DB not reachable yet... retrying"
    sleep "$WAIT_SECS"
  fi
done

if [ "$success" -ne 1 ]; then
  echo "✗ Database not reachable after ${TRY_COUNT} attempts."
  echo "  Debugging: Check 'docker compose logs db' for database startup issues"
  exit 2
fi

echo ""
echo "Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma
echo "✓ Prisma client generated"
echo ""

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
echo "✓ Migrations applied"
echo ""

# Locate built entry file (prefer dist/src/main.js)
if [ -f ./dist/src/main.js ]; then
  ENTRY_FILE="./dist/src/main.js"
elif [ -f ./dist/main.js ]; then
  ENTRY_FILE="./dist/main.js"
elif [ -f ./dist/index.js ]; then
  ENTRY_FILE="./dist/index.js"
else
  echo "✗ No entry file found under ./dist"
  echo "  Checked: dist/src/main.js, dist/main.js, dist/index.js"
  exit 1
fi

echo "Starting Node app at $ENTRY_FILE"
node "$ENTRY_FILE"
