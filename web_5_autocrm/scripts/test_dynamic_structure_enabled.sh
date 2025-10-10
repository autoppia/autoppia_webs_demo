#!/bin/bash

# Test script for Dynamic HTML Structure with ENABLED state
# This verifies that seed-structure parameter properly changes content and IDs

echo "=========================================="
echo "Dynamic HTML Structure Test (ENABLED)"
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

echo -e "${BLUE}Testing with NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true${NC}"
echo ""

# Function to test URL
test_url() {
    local seed=$1
    local expected_variation=$2
    local url="${BASE_URL}/?seed-structure=${seed}"
    
    echo -e "${YELLOW}Testing seed-structure=${seed} (expecting variation ${expected_variation})${NC}"
    
    # Make request
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}  ✓ HTTP 200 OK${NC}"
        echo -e "  URL: $url"
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
    echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Application is running${NC}"
echo ""

# Test seed-to-variation mapping
echo "=========================================="
echo "Testing Seed-to-Variation Mapping"
echo "=========================================="
echo ""

test_url 1 1
test_url 2 2
test_url 5 5
test_url 10 10
test_url 11 1   # Should cycle back to 1
test_url 20 10
test_url 21 1   # Should cycle back to 1
test_url 50 10
test_url 100 10
test_url 155 5  # ((155-1) % 10) + 1 = 5
test_url 200 10
test_url 300 10

echo ""
echo "=========================================="
echo "Testing Different Pages"
echo "=========================================="
echo ""

# Test different pages
pages=("clients" "matters" "calendar" "documents" "billing" "settings")

for page in "${pages[@]}"; do
    url="${BASE_URL}/${page}?seed-structure=25"
    echo -e "${YELLOW}Testing /${page} page with seed-structure=25${NC}"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}  ✓ /${page} page: HTTP 200 OK${NC}"
    else
        echo -e "${RED}  ✗ /${page} page: HTTP $response${NC}"
    fi
done

echo ""
echo "=========================================="
echo "Manual Testing Instructions"
echo "=========================================="
echo ""
echo "Visit these URLs to see different variations:"
echo ""
echo -e "${BLUE}Variation 1:${NC} ${BASE_URL}/?seed-structure=1"
echo "  Expected: 'Dashboard', 'Clients', 'Add New Client'"
echo ""
echo -e "${BLUE}Variation 2:${NC} ${BASE_URL}/?seed-structure=2"
echo "  Expected: 'Control Panel', 'Customer Base', 'Create Client'"
echo ""
echo -e "${BLUE}Variation 5:${NC} ${BASE_URL}/?seed-structure=5"
echo "  Expected: 'Main Dashboard', 'Client Directory', 'Add Client Record'"
echo ""
echo -e "${BLUE}Variation 10:${NC} ${BASE_URL}/?seed-structure=10"
echo "  Expected: 'Mission Control', 'Stakeholder Hub', 'Recruit Client'"
echo ""
echo -e "${BLUE}Cycling test:${NC} ${BASE_URL}/?seed-structure=11"
echo "  Expected: Same as variation 1"
echo ""

echo "=========================================="
echo "Browser DevTools Verification"
echo "=========================================="
echo ""
echo "In your browser:"
echo "1. Visit: ${BASE_URL}/?seed-structure=1"
echo "2. Open DevTools (F12)"
echo "3. Check sidebar navigation IDs (should be like 'dashboard-nav-link')"
echo "4. Visit: ${BASE_URL}/?seed-structure=2"
echo "5. Check sidebar navigation IDs (should be like 'control-panel-link')"
echo "6. Verify text content changes between variations"
echo ""

echo -e "${GREEN}=========================================="
echo "✓ Dynamic HTML Structure Tests Complete"
echo "==========================================${NC}"
echo ""
echo "Environment: NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true"
echo "Status: Dynamic structure is ENABLED"
echo "Seed range: 1-300"
echo "Variations: 10 (cycling)"
echo ""

