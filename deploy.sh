#!/bin/bash
# Quick deployment script for Base Sepolia

# 1. Compile contracts
echo "📦 Compiling contracts..."
cd contracts
pnpm compile
cd ..

# 2. Deploy to Base Sepolia
echo "🚀 Deploying to Base Sepolia..."
cd contracts
pnpm deploy
cd ..

# 3. Start frontend
echo "⚡ Starting frontend dev server..."
pnpm --filter frontend dev

echo "✅ Done! Visit http://localhost:3000"
