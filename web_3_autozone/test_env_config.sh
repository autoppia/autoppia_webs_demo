#!/bin/bash

# Test script to verify ENABLE_DYNAMIC_HTML configuration
echo "🧪 Testing ENABLE_DYNAMIC_HTML Configuration"
echo "============================================="

echo ""
echo "📋 Local Development Test:"
echo "Running npm run dev to check environment variables..."
echo ""

# Start dev server in background and capture output
npm run dev &
DEV_PID=$!

# Wait a moment for the server to start
sleep 5

# Kill the dev server
kill $DEV_PID 2>/dev/null

echo ""
echo "📋 Production Build Test:"
echo "Running npm run build to check environment variables..."
echo ""

# Run build and capture output
npm run build 2>&1 | grep -E "(NODE_ENV|DOCKER_BUILD|isLocalDev|isDockerBuild|ENABLE_DYNAMIC_HTML|NEXT_PUBLIC_ENABLE_DYNAMIC_HTML)"

echo ""
echo "✅ Configuration Summary:"
echo "- Local development (npm run dev): Should show ENABLE_DYNAMIC_HTML=true"
echo "- Production build (npm run build): Should show ENABLE_DYNAMIC_HTML=false"
echo "- Docker builds: Will override via build args"
