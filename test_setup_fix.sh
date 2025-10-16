#!/usr/bin/env bash
# Test script to verify setup.sh fix for ENABLE_DYNAMIC_HTML

echo "🧪 Testing setup.sh fix for ENABLE_DYNAMIC_HTML"
echo "================================================"
echo ""

# Test 1: Check syntax
echo "✓ Test 1: Checking bash syntax..."
if bash -n scripts/setup.sh; then
    echo "  ✅ Syntax is valid"
else
    echo "  ❌ Syntax error detected"
    exit 1
fi
echo ""

# Test 2: Verify ENABLE_DYNAMIC_HTML_DEFAULT is defined
echo "✓ Test 2: Checking ENABLE_DYNAMIC_HTML_DEFAULT..."
if grep -q "ENABLE_DYNAMIC_HTML_DEFAULT=false" scripts/setup.sh; then
    echo "  ✅ Default value is set"
else
    echo "  ❌ Default value not found"
    exit 1
fi
echo ""

# Test 3: Verify flag parsing
echo "✓ Test 3: Checking --enable_dynamic_html flag parsing..."
if grep -q "enable_dynamic_html=\*) ENABLE_DYNAMIC_HTML=" scripts/setup.sh; then
    echo "  ✅ Flag parsing is configured"
else
    echo "  ❌ Flag parsing not found"
    exit 1
fi
echo ""

# Test 4: Verify variable assignment with default
echo "✓ Test 4: Checking ENABLE_DYNAMIC_HTML assignment..."
if grep -q 'ENABLE_DYNAMIC_HTML="${ENABLE_DYNAMIC_HTML:-$ENABLE_DYNAMIC_HTML_DEFAULT}"' scripts/setup.sh; then
    echo "  ✅ Variable assignment with default is correct"
else
    echo "  ❌ Variable assignment not found or incorrect"
    exit 1
fi
echo ""

# Test 5: Verify it's displayed in configuration
echo "✓ Test 5: Checking configuration output..."
if grep -q "Dynamic HTML enabled:" scripts/setup.sh; then
    echo "  ✅ Configuration display is present"
else
    echo "  ❌ Configuration display not found"
    exit 1
fi
echo ""

# Test 6: Verify it's passed to docker compose
echo "✓ Test 6: Checking docker compose variable passing..."
if grep -q 'ENABLE_DYNAMIC_HTML="$ENABLE_DYNAMIC_HTML"' scripts/setup.sh; then
    echo "  ✅ Variable is passed to docker compose"
else
    echo "  ❌ Variable not passed to docker compose"
    exit 1
fi
echo ""

echo "================================================"
echo "✅ All tests passed!"
echo ""
echo "You can now run:"
echo "  bash scripts/setup.sh --demo=autolodge --web_port=8002 --enable_dynamic_html=true"
echo ""

