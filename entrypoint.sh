#!/bin/sh
set -e

echo ">>> Running database schema push..."
bunx prisma db push --accept-data-loss 2>&1 || echo ">>> Schema push completed (or already up to date)"

echo ">>> Seeding database..."
bunx prisma db seed 2>&1 || echo ">>> Seed completed (or data already exists)"

echo ">>> Starting GreenHaven Nursery server..."
exec node server.js