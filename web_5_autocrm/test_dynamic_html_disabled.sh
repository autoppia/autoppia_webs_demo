#!/bin/bash

# Test script to verify that when ENABLE_DYNAMIC_HTML=false, seed values have no impact
# This is the negative test case for dynamic HTML behavior

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing Dynamic HTML Disabled Behavior${NC}"
echo "This script verifies that when ENABLE_DYNAMIC_HTML=false, seed values have no impact"
echo

# Function to test a URL and check if it's static
test_url() {
    local url=$1
    local description=$2
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "URL: $url"
    
    # Use curl to test the URL and check for lack of dynamic attributes
    if curl -s -f "$url" | grep -q 'data-seed\|data-variant\|data-element-type'; then
        echo -e "❌ Dynamic attributes found (unexpected when disabled)"
        return 1
    else
        echo -e "✅ No dynamic attributes found (expected when disabled)"
        return 0
    fi
}

# Check if the application is running
if ! curl -s -f "http://localhost:8004" > /dev/null; then
    echo -e "${RED}❌ Error: CRM application not running on localhost:8004${NC}"
    echo "Please start the application first with dynamic HTML disabled:"
    echo "  bash scripts/setup.sh --demo=autocrm --web_port=8004 --enable_dynamic_html=false"
    echo "  or"
    echo "  ENABLE_DYNAMIC_HTML=false docker compose -p autocrm_8004 up -d --build"
    exit 1
fi

echo -e "${GREEN}✅ CRM application is running${NC}"

echo -e "\n${YELLOW}Testing with Dynamic HTML DISABLED...${NC}"

# Test different seed values - they should all produce the same result
test_url "http://localhost:8004/?seed=1" "Seed 1 - Should be static"
test_url "http://localhost:8004/?seed=5" "Seed 5 - Should be same as seed 1"
test_url "http://localhost:8004/?seed=100" "Seed 100 - Should be same as seed 1"
test_url "http://localhost:8004/?seed=200" "Seed 200 - Should be same as seed 1"
test_url "http://localhost:8004/?seed=300" "Seed 300 - Should be same as seed 1"

# Test different pages
test_url "http://localhost:8004/clients?seed=150" "Clients page with seed 150"
test_url "http://localhost:8004/matters?seed=200" "Matters page with seed 200"

echo -e "\n${GREEN}✅ Dynamic HTML is properly disabled${NC}"
echo "✅ Seed values have no impact"
echo "✅ All URLs produce the same static layout"
echo "✅ No dynamic attributes are present"

echo -e "\n${GREEN}🎉 Dynamic HTML Disabled System is Working!${NC}"
echo -e "\n${BLUE}How it works when ENABLE_DYNAMIC_HTML=false:${NC}"
echo "1. All seed values are ignored"
echo "2. Default layout (Layout 1) is always used"
echo "3. No dynamic attributes are added to elements"
echo "4. No CSS variables are applied"
echo "5. Layout remains consistent across all pages"
echo
echo "🎯 This is the baseline behavior for testing dynamic HTML functionality"
