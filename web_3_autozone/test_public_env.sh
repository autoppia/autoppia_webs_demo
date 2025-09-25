#!/bin/bash

echo "🧪 Testing NEXT_PUBLIC_ENABLE_DYNAMIC_HTML Configuration"
echo "========================================================"

echo ""
echo "📋 Testing Development Mode:"
echo "Starting dev server to check environment variables..."

# Set NODE_ENV to development to simulate dev mode
export NODE_ENV=development

# Run a quick build check with development environment
NODE_ENV=development node -e "
const nextConfig = require('./next.config.js');
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isLocalDev should be true');
"

echo ""
echo "📋 Testing Production Mode:"
echo "Running production build check..."

# Run build to see production values
npm run build 2>&1 | grep -E "(NODE_ENV|isLocalDev|NEXT_PUBLIC_ENABLE_DYNAMIC_HTML)" | head -10

echo ""
echo "✅ Expected Results:"
echo "- Development mode: NEXT_PUBLIC_ENABLE_DYNAMIC_HTML should be 'true'"
echo "- Production mode: NEXT_PUBLIC_ENABLE_DYNAMIC_HTML should be 'false'"
