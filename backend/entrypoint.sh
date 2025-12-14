#!/bin/bash
set -e

## Minimal entrypoint
# Use pg_isready to check database connection (works with DATABASE_URL directly)

TRY_COUNT=20
WAIT_SECS=2

echo "📡 Checking database connection using DATABASE_URL..."
echo "Probing database (up to ${TRY_COUNT} attempts)"

success=0
i=0
while [ $i -lt $TRY_COUNT ]; do
  i=$((i+1))
  
  # pg_isready can use DATABASE_URL directly via -d flag
  if pg_isready -d "$DATABASE_URL" -t 1 > /dev/null 2>&1; then
    echo "✓ Database is reachable (attempt $i)"
    success=1
    break
  fi
  
  if [ $i -lt $TRY_COUNT ]; then
    echo "  [attempt $i/$TRY_COUNT] Database not reachable yet... retrying"
    sleep "$WAIT_SECS"
  fi
done

if [ "$success" -ne 1 ]; then
  echo "✗ Database not reachable after ${TRY_COUNT} attempts."
  echo "  DATABASE_URL: ${DATABASE_URL}"
  echo "  Debugging: Check database status in Render dashboard"
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

echo "Running database seed (will skip if admin already exists)..."
# Run seed with ts-node using tsx wrapper for better TypeScript support in Docker
npx tsx prisma/seed.ts || echo "⚠ Seed skipped (admin user may already exist)"
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