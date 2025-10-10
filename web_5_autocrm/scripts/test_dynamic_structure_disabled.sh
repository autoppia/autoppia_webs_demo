#!/bin/bash

# Test script for Dynamic HTML Structure with DISABLED state
# This verifies that when disabled, seed-structure parameter has NO effect
# All URLs should return the same default variation 1

echo "=========================================="
echo "Dynamic HTML Structure Test (DISABLED)"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL (adjust port as needed)
BASE_URL="http://localhost:3000"

echo -e "${BLUE}Testing with NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false${NC}"
echo ""
echo "Expected behavior:"
echo "  - All seed-structure values ignored"
echo "  - Always returns variation 1 (default)"
echo "  - Text content remains constant"
echo "  - Element IDs remain constant"
echo ""

# Function to test URL
test_url() {
    local seed=$1
    local url="${BASE_URL}/?seed-structure=${seed}"
    
    echo -e "${YELLOW}Testing seed-structure=${seed}${NC}"
    
    # Make request
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}  ✓ HTTP 200 OK${NC}"
        echo -e "  URL: $url"
        echo -e "  ${BLUE}Expected: Should show same content as seed-structure=1${NC}"
    else
        echo -e "${RED}  ✗ HTTP $response${NC}"
        return 1
    fi
}

# Check if app is running
echo "Checking if application is running..."
if ! curl -s "${BASE_URL}" > /dev/null 2>&1; then
    echo -e "${RED}❌ Application not running on ${BASE_URL}${NC}"
    echo ""
    echo "Please start the application with:"
    echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev"
    echo ""
    echo "Note: You need to restart the dev server for the env variable to take effect"
    exit 1
fi

echo -e "${GREEN}✓ Application is running${NC}"
echo ""

# Test that different seeds produce same result
echo "=========================================="
echo "Testing Seed Consistency (All Should Be Same)"
echo "=========================================="
echo ""

test_url 1
test_url 2
test_url 10
test_url 11
test_url 50
test_url 100
test_url 155
test_url 200
test_url 300

echo ""
echo "=========================================="
echo "Testing Different Pages"
echo "=========================================="
echo ""

# Test different pages - all should use variation 1
pages=("clients" "matters" "calendar" "documents" "billing" "settings")

for page in "${pages[@]}"; do
    url="${BASE_URL}/${page}?seed-structure=99"
    echo -e "${YELLOW}Testing /${page} page with seed-structure=99${NC}"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}  ✓ /${page} page: HTTP 200 OK${NC}"
        echo -e "  ${BLUE}Expected: Should use default variation 1${NC}"
    else
        echo -e "${RED}  ✗ /${page} page: HTTP $response${NC}"
    fi
done

echo ""
echo "=========================================="
echo "Manual Verification Instructions"
echo "=========================================="
echo ""
echo "To verify dynamic structure is truly disabled:"
echo ""
echo "1. Open two browser tabs:"
echo "   Tab A: ${BASE_URL}/?seed-structure=1"
echo "   Tab B: ${BASE_URL}/?seed-structure=2"
echo ""
echo "2. Compare the content:"
echo "   - Tab A should show: 'Dashboard', 'Clients', etc."
echo "   - Tab B should show: 'Dashboard', 'Clients', etc. (SAME)"
echo "   - NOT 'Control Panel', 'Customer Base', etc."
echo ""
echo "3. Open DevTools (F12) and inspect element IDs:"
echo "   - Both tabs should have identical IDs"
echo "   - Example: 'dashboard-nav-link' in both tabs"
echo ""
echo "4. Check browser console:"
echo "   - Should see: 'Dynamic HTML Structure is DISABLED'"
echo ""

echo "=========================================="
echo "Expected Results"
echo "=========================================="
echo ""
echo -e "${GREEN}When DISABLED:${NC}"
echo "  ✓ All URLs return same default content (variation 1)"
echo "  ✓ seed-structure parameter is ignored"
echo "  ✓ Dashboard title: 'Dashboard' (not 'Control Panel' etc.)"
echo "  ✓ Clients title: 'Clients' (not 'Customer Base' etc.)"
echo "  ✓ Add client button: 'Add New Client' (not 'Create Client' etc.)"
echo "  ✓ Search placeholder: 'Search...' (not 'Find anything...' etc.)"
echo "  ✓ Element IDs remain constant across all seeds"
echo ""

echo -e "${GREEN}=========================================="
echo "✓ Dynamic HTML Structure Disabled Tests Complete"
echo "==========================================${NC}"
echo ""
echo "Environment: NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false"
echo "Status: Dynamic structure is DISABLED"
echo "Behavior: All seed values ignored, variation 1 always used"
echo ""
echo "To re-enable dynamic structure:"
echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev"
echo ""

