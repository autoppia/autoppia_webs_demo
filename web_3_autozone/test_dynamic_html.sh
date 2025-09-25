#!/bin/bash

# Test script for dynamic HTML implementation
echo "🧪 Testing Dynamic HTML Implementation for web_3_autozone"
echo "=================================================="

# Test 1: Static mode (default)
echo "📋 Test 1: Static Mode (enable_dynamic_html=false)"
echo "Running setup with static mode..."
cd "$(dirname "$0")"
bash setup.sh --demo=autozone --enable_dynamic_html=false --web_port=8002

echo "✅ Static mode deployed. Check http://localhost:8002"
echo "   - Should show static content without dynamic product data"
echo "   - Search should return no results"
echo "   - Product detail pages should work with static data"
echo "   - Layout should remain consistent regardless of seed parameter (always seed=1)"
echo "   - Try URLs: http://localhost:8002?seed=1 and http://localhost:8002?seed=2"
echo "   - Both should show identical layouts"
echo

# Wait for user to test
read -p "Press Enter after testing static mode..."

# Test 2: Dynamic mode
echo "📋 Test 2: Dynamic Mode (enable_dynamic_html=true)"
echo "Running setup with dynamic mode..."
bash setup.sh --demo=autozone --enable_dynamic_html=true --web_port=8003

echo "✅ Dynamic mode deployed. Check http://localhost:8003"
echo "   - Should show dynamic content from seed data"
echo "   - Search should return filtered results from products.ts"
echo "   - Product detail pages should work with dynamic data"
echo "   - Category cards should show real product data"
echo "   - Product carousels should show filtered products by category"
echo "   - Layout should vary based on seed parameter (1-300 range)"
echo "   - Try URLs: http://localhost:8003?seed=1 and http://localhost:8003?seed=2"
echo "   - Try extended range: http://localhost:8003?seed=76 (maps to layout 3)"
echo "   - Try extended range: http://localhost:8003?seed=23 (maps to layout 1)"
echo "   - Should show different layouts based on seed value"
echo

# Wait for user to test
read -p "Press Enter after testing dynamic mode..."

echo "🎉 Testing complete!"
echo "Both modes should work independently:"
echo "  - Static mode: Traditional behavior with hardcoded content, consistent layout (seed=1)"
echo "  - Dynamic mode: Data-driven content from products.ts seed data, variable layout"
echo
echo "To switch between modes, use:"
echo "  --enable_dynamic_html=false  (static mode, layout always seed=1)"
echo "  --enable_dynamic_html=true   (dynamic mode, layout varies with seed)"
