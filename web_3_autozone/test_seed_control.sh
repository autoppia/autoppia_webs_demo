#!/bin/bash

# Test script for seed control implementation
echo "🧪 Testing Seed Control Implementation for web_3_autozone"
echo "=================================================="

# Test 1: Dynamic HTML disabled (should use seed=1 regardless of URL seed)
echo "📋 Test 1: Dynamic HTML Disabled (enable_dynamic_html=false)"
echo "Running setup with dynamic HTML disabled..."
cd "$(dirname "$0")"
bash ../scripts/setup.sh --demo=autozone --enable_dynamic_html=false --web_port=8002

echo "✅ Dynamic HTML disabled deployed. Check http://localhost:8002"
echo "   - Should show static content without dynamic product data"
echo "   - Layout should remain consistent regardless of seed parameter"
echo "   - Try URLs: http://localhost:8002?seed=1 and http://localhost:8002?seed=2"
echo "   - Both should show identical layouts (seed=1 behavior)"
echo

# Wait for user to test
read -p "Press Enter after testing dynamic HTML disabled mode..."

# Test 2: Dynamic HTML enabled (should respect seed parameter)
echo "📋 Test 2: Dynamic HTML Enabled (enable_dynamic_html=true)"
echo "Running setup with dynamic HTML enabled..."
bash ../scripts/setup.sh --demo=autozone --enable_dynamic_html=true --web_port=8003

echo "✅ Dynamic HTML enabled deployed. Check http://localhost:8003"
echo "   - Should show dynamic content from seed data"
echo "   - Layout should change based on seed parameter"
echo "   - Try URLs: http://localhost:8003?seed=1 and http://localhost:8003?seed=2"
echo "   - Should show different layouts based on seed value"
echo

# Wait for user to test
read -p "Press Enter after testing dynamic HTML enabled mode..."

echo "🎉 Testing complete!"
echo "Expected behavior:"
echo "  - Dynamic HTML disabled: Layout always uses seed=1 (consistent)"
echo "  - Dynamic HTML enabled: Layout varies based on seed parameter"
echo
echo "To switch between modes, use:"
echo "  --enable_dynamic_html=false  (static layout, seed=1 always)"
echo "  --enable_dynamic_html=true   (dynamic layout, respects seed)"
