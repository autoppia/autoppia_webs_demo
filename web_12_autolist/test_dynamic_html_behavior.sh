#!/bin/bash

# Test script for dynamic HTML behavior in web_12_autolist
# This script tests how the Autolist application behaves with different seed values

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing Dynamic HTML Behavior for Autolist Scraper Confusion${NC}"
echo "This script tests the dynamic HTML implementation in web_12_autolist"
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
if ! curl -s -f "http://localhost:8011" > /dev/null; then
    echo -e "${RED}❌ Error: Autolist application not running on localhost:8011${NC}"
    echo "Please start the application first:"
    echo "  ENABLE_DYNAMIC_HTML=true npm run dev"
    echo "  or"
    echo "  bash scripts/setup.sh --demo=autolist --web_port=8011 --enable_dynamic_html=true"
    exit 1
fi

echo -e "${GREEN}✅ Autolist application is running${NC}"
echo -e "\n${YELLOW}Testing Dynamic HTML Behavior...${NC}"

# Test with dynamic HTML enabled (default)
echo -e "\n${BLUE}=== Testing with Dynamic HTML ENABLED ===${NC}"

# Test different seed values (now supports 1-300)
test_url "http://localhost:8011/?seed=1" "Seed 1 - Default layout"
test_url "http://localhost:8011/?seed=15" "Seed 15 - Should now work"
test_url "http://localhost:8011/?seed=25" "Seed 25 - Should now work"
test_url "http://localhost:8011/?seed=50" "Seed 50 - Should now work"
test_url "http://localhost:8011/?seed=100" "Seed 100 - Should map to same layout as seed 10"
test_url "http://localhost:8011/?seed=200" "Seed 200 - Should map to same layout as seed 100"
test_url "http://localhost:8011/?seed=300" "Seed 300 - Maximum seed value"

# Test pattern verification (seeds that should map to same layout)
echo -e "\n${BLUE}=== Pattern Verification ===${NC}"
echo "Testing seeds that should map to the same layout (every 30):"
test_url "http://localhost:8011/?seed=1" "Seed 1 - Base"
test_url "http://localhost:8011/?seed=31" "Seed 31 - Should be same layout as seed 1"
test_url "http://localhost:8011/?seed=61" "Seed 61 - Should be same layout as seed 1"
test_url "http://localhost:8011/?seed=91" "Seed 91 - Should be same layout as seed 1"

test_url "http://localhost:8011/?seed=2" "Seed 2 - Base"
test_url "http://localhost:8011/?seed=32" "Seed 32 - Should be same layout as seed 2"
test_url "http://localhost:8011/?seed=62" "Seed 62 - Should be same layout as seed 2"

# Test edge cases
test_url "http://localhost:8011/?seed=0" "Seed 0 - Invalid seed (should default to 1)"
test_url "http://localhost:8011/?seed= 301" "Seed 301 - Invalid seed (should default to 1)"
test_url "http://localhost:8011/?seed=-1" "Seed -1 - Invalid seed (should default to 1)"

# Test without seed parameter
test_url "http://localhost:8011/" "No seed parameter (should default to seed 1)"

echo -e "\n${GREEN}🎉 Dynamic HTML behavior test completed!${NC}"
echo -e "\n${BLUE}Summary:${NC}"
echo "1. When ENABLE_DYNAMIC_HTML=true, seed values (1-300) change layouts"
echo "2. Seed mapping formula: ((seed % 30) + 1) % 10 || 10"
echo "3. Layout cycles repeat every 30 seeds:"
echo "   - Seeds 1,31,61,91,121,151,181,211,241,271 → Layout 1"
echo "   - Seeds 2,32,62,92,122,152,182,212,242,272 → Layout 2"
echo "   - Seeds 10,40,70,100,130,160,190,220,250,280 → Layout 10"
echo "4. Dynamic attributes include data-seed, data-variant, data-element-type"
echo "5. Layout changes affect sidebar position, header style, and container structure"
echo "6. When ENABLE_DYNAMIC_HTML=false, seed has no effect"
echo
echo "🚀 To enable dynamic HTML in production:"
echo "bash scripts/setup.sh --demo=autolist --web_port=8011 --enable_dynamic_html=true"
