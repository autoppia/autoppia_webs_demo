#!/bin/bash

# Test script for dynamic HTML implementation
echo "🧪 Testing Dynamic HTML Implementation for web_4_autodining"
echo "=================================================="

# Test 1: Static mode (default)
echo "📋 Test 1: Static Mode (enable_dynamic_html=false)"
echo "Running setup with static mode..."
cd "$(dirname "$0")"
bash ../scripts/setup.sh --demo=autodining --enable_dynamic_html=false --web_port=8002

echo "✅ Static mode deployed. Check http://localhost:8002"
echo "   - Should show static content without dynamic layout variations"
echo "   - Layout should remain consistent regardless of seed parameter (always seed=1)"
echo "   - Try URLs: http://localhost:8002?seed=1 and http://localhost:8002?seed=2"
echo "   - Both should show identical layouts (seed=1 behavior)"
echo

# Wait for user to test
read -p "Press Enter after testing static mode..."

# Test 2: Dynamic mode
echo "📋 Test 2: Dynamic Mode (enable_dynamic_html=true)"
echo "Running setup with dynamic mode..."
bash ../scripts/setup.sh --demo=autodining --enable_dynamic_html=true --web_port=8003

echo "✅ Dynamic mode deployed. Check http://localhost:8003"
echo "   - Should show dynamic content with layout variations"
echo "   - Layout should vary based on seed parameter"
echo "   - Try URLs: http://localhost:8003?seed=1 and http://localhost:8003?seed=2"
echo "   - Should show different layouts based on seed value"
echo

# Wait for user to test
read -p "Press Enter after testing dynamic mode..."

echo "🎉 Testing complete!"
echo "Both modes should work independently:"
echo "  - Static mode: Traditional behavior with consistent layout (seed=1 always)"
echo "  - Dynamic mode: Layout variations based on seed parameter"
echo
echo "To switch between modes, use:"
echo "  --enable_dynamic_html=false  (static mode, layout always seed=1)"
echo "  --enable_dynamic_html=true   (dynamic mode, layout varies with seed)"
