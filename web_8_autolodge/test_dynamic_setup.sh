#!/bin/bash
# Test script to verify dynamic HTML setup for web_8_autolodge

echo "🧪 Testing Dynamic HTML Setup for web_8_autolodge"
echo "================================================"
echo ""

# Test 1: Check if setup.sh has the flag
echo "✓ Test 1: Checking setup.sh for --enable_dynamic_html flag"
if grep -q "enable_dynamic_html" ../../scripts/setup.sh; then
    echo "  ✅ Flag found in setup.sh"
else
    echo "  ❌ Flag NOT found in setup.sh"
fi
echo ""

# Test 2: Check docker-compose.yml
echo "✓ Test 2: Checking docker-compose.yml for ENABLE_DYNAMIC_HTML"
if grep -q "ENABLE_DYNAMIC_HTML" docker-compose.yml; then
    echo "  ✅ Environment variables configured"
    grep "ENABLE_DYNAMIC_HTML" docker-compose.yml | sed 's/^/    /'
else
    echo "  ❌ Environment variables NOT configured"
fi
echo ""

# Test 3: Check Dockerfile
echo "✓ Test 3: Checking Dockerfile for ENABLE_DYNAMIC_HTML"
if grep -q "ENABLE_DYNAMIC_HTML" Dockerfile; then
    echo "  ✅ Build argument configured"
    grep "ENABLE_DYNAMIC_HTML" Dockerfile | sed 's/^/    /'
else
    echo "  ❌ Build argument NOT configured"
fi
echo ""

# Test 4: Check source files
echo "✓ Test 4: Checking source files"
files=(
    "src/utils/seedLayout.ts"
    "src/utils/dynamicDataProvider.ts"
    "src/library/utils.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file MISSING"
    fi
done
echo ""

# Test 5: Usage example
echo "✓ Test 5: Usage Examples"
echo "  To enable dynamic HTML for autolodge:"
echo ""
echo "    cd ../.."
echo "    bash scripts/setup.sh --demo=autolodge --enable_dynamic_html=true"
echo ""
echo "  Or for all demos:"
echo ""
echo "    bash scripts/setup.sh --demo=all --enable_dynamic_html=true"
echo ""
echo "  Then test with different seeds (1-300):"
echo ""
echo "    http://localhost:8007/?seed=1"
echo "    http://localhost:8007/?seed=150"
echo "    http://localhost:8007/?seed=200"
echo ""

echo "================================================"
echo "✅ Setup verification complete!"

