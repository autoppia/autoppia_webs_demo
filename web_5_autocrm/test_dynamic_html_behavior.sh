#!/bin/bash

# Test script for dynamic HTML behavior in web_5_autocrm
# This script tests how the CRM application behaves with different seed values

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing Dynamic HTML Behavior for CRM Scraper Confusion${NC}"
echo "This script tests the dynamic HTML implementation in web_5_autocrm"
echo

# Function to test a URL and check for dynamic attributes
test_url() {
    local url=$1
    local description=$2
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "URL: $url"
    
    # Use curl to test the URL and check for dynamic attributes
    if curl -s -f "$url" | grep -q 'data-seed\|data-variant\|data-element-type'; then
        echo -e "✅ Dynamic attributes found"
    else
        echo -e "❌ No dynamic attributes found"
    fi
}

# Check if the application is running
if ! curl -s -f "http://localhost:8004" > /dev/null; then
    echo -e "${RED}❌ Error: CRM application not running on localhost:8004${NC}"
    echo "Please start the application first:"
    echo "  ENABLE_DYNAMIC_HTML=true npm run dev"
    echo "  or"
    echo "  ENABLE_DYNAMIC_HTML=true docker compose up -d --build"
    exit 1
fi

echo -e "${GREEN}✅ CRM application is running${NC}"
echo -e "\n${YELLOW}Testing Dynamic HTML Behavior...${NC}"

# Test with dynamic HTML enabled (default)
echo -e "\n${BLUE}=== Testing with Dynamic HTML ENABLED ===${NC}"

# Test different seed values
test_url "http://localhost:8004/?seed=1" "Seed 1 - Default layout"
test_url "http://localhost:8004/?seed=5" "Seed 5 - Special layout (Layout 2)"
test_url "http://localhost:8004/?seed=8" "Seed 8 - Special layout (Layout 1)"
test_url "http://localhost:8004/?seed=25" "Seed 25 - Special layout (Layout 2)"
test_url "http://localhost:8004/?seed=160" "Seed 160 - Special range (Layout 3)"
test_url "http://localhost:8004/?seed=180" "Seed 180 - Special layout (Layout 11)"
test_url "http://localhost:8004/?seed=200" "Seed 200 - Special layout (Layout 20)"
test_url "http://localhost:8004/?seed=300" "Seed 300 - Maximum seed value"

# Test different pages with seeds
test_url "http://localhost:8004/clients?seed=150" "Clients page with seed 150"
test_url "http://localhost:8004/matters?seed=200" "Matters page with seed 200"
test_url "http://localhost:8004/calendar?seed=75" "Calendar page with seed 75"

# Test edge cases
test_url "http://localhost:8004/?seed=0" "Seed 0 - Invalid seed (should default to 1)"
test_url "http://localhost:8004/?seed=301" "Seed 301 - Invalid seed (should default to 1)"
test_url "http://localhost:8004/?seed=-1" "Seed -1 - Invalid seed (should default to 1)"

# Test without seed parameter
test_url "http://localhost:8004/" "No seed parameter (should default to seed 1)"

echo -e "\n${BLUE}=== Testing with Dynamic HTML DISABLED ===${NC}"
echo "Note: To test with dynamic HTML disabled, restart the application with:"
echo "  ENABLE_DYNAMIC_HTML=false npm run dev"
echo "Then run this script again."

echo -e "\n${GREEN}🎉 Dynamic HTML behavior test completed!${NC}"
echo -e "\n${BLUE}Summary:${NC}"
echo "1. When ENABLE_DYNAMIC_HTML=true, seed values (1-300) change layouts"
echo "2. Special seed values have predefined layouts:"
echo "   - Seeds ending in 5 (5,15,25...) → Layout 2"
echo "   - Seeds 160-170 → Layout 3"  
echo "   - Seed 8 → Layout 1"
echo "   - Seeds 180,190,200,210,250,260,270 → Special layouts"
echo "3. Dynamic attributes include data-seed, data-variant, data-element-type"
echo "4. Layout changes affect button styles, spacing, and component positioning"
echo "5. When ENABLE_DYNAMIC_HTML=false, seed has no効果"
echo
echo "🚀 To enable dynamic HTML in production:"
echo "bash scripts/setup.sh --demo=autocrm --web_port=8004 --enable_dynamic_html=true"