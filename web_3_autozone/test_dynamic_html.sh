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
echo

# Wait for user to test
read -p "Press Enter after testing dynamic mode..."

echo "🎉 Testing complete!"
echo "Both modes should work independently:"
echo "  - Static mode: Traditional behavior with hardcoded content"
echo "  - Dynamic mode: Data-driven content from products.ts seed data"
echo
echo "To switch between modes, use:"
echo "  --enable_dynamic_html=false  (static mode)"
echo "  --enable_dynamic_html=true   (dynamic mode)"
