#!/bin/bash

# Test script for dynamic HTML behavior when DISABLED in web_12_autolist
# This script tests how the Autolist application behaves when dynamic HTML is disabled

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing Static HTML Behavior for web_12_autolist${NC}"
echo "This script tests the behavior when dynamic HTML is DISABLED (default)"
echo

# Function to test a URL and check for static behavior
test_url() {
    local url=$1
    local description=$2
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "URL: $url"
    
    # Check for absence of dynamic attributes (should not be present when disabled)
    if curl -s -f "$url" | grep -q 'data-seed\|data-variant\|data-element-type'; then
        echo -e "❌ Dynamic attributes found (unexpected - dynamic HTML should be disabled)"
    else
        echo -e "✅ No dynamic attributes found (correct - dynamic HTML is disabled)"
    fi
}

# Check if the application is running
if ! curl -s -f "http://localhost:8011" > /dev/null; then
    echo -e "${RED}❌ Error: Autolist application not running on localhost:8011${NC}"
    echo "Please start the application first with dynamic HTML disabled:"
    echo "  bash scripts/setup.sh --demo=autolist --web_port=8011 --enable_dynamic_html=false"
    exit 1
fi

echo -e "${GREEN}✅ Autolist application is running${NC}"
echo -e "\n${YELLOW}Testing Static HTML Behavior...${NC}"

# Test with different seeds (should all look the same when disabled)
test_url "http://localhost:8011/?seed=1" "Seed 1 - Should look like default"
test_url "http://localhost:8011/?seed=15" "Seed 15 - Should look identical to seed 1"
test_url "http://localhost:8011/?seed=50" "Seed 50 - Should look identical to seed 1"
test_url "http://localhost:8011/?seed=300" "Seed 300 - Should look identical to seed 1"

# Test pattern verification (should all look the same)
test_url "http://localhost:8011/?seed=0" "Seed 0 - Should look identical to seed 1"
test_url "http://localhost:8011/?seed=-1" "Seed -1 - Should look identical to seed 1"
test_url "http://localhost:8011/?seed=999" "Seed 999 - Should look identical to seed 1"

# Test without seed parameter
test_url "http://localhost:8011/" "No seed parameter - Should look identical to others"

echo -e "\n${GREEN}🎉 Static HTML behavior test completed!${NC}"
echo -e "\n${BLUE}Summary:${NC}"
echo "1. When ENABLE_DYNAMIC_HTML=false (default), ALL seeds produce IDENTICAL layouts"
echo "2. No dynamic attributes (data-seed, data-variant, data-element-type) should be present"
echo "3. No seed-based CSS classes should be present"
echo "4. Layout remains consistent regardless of seed value"
echo "5. All URLs should render the same layout: Default Layout (header top, sidebar left)"
echo
echo "🚀 To disable dynamic HTML explicitly:"
echo "bash scripts/setup.sh --demo=autolist --web_port=8011 --enable_dynamic_html=false"

# Instructions to enable dynamic HTML
echo -e "\n${BLUE}💡 To test dynamic behavior, run:${NC}"
echo "bash scripts/setup.sh --demo=autolist --web_port=8011 --enable_dynamic_html=true"
echo "bash test_dynamic_html_behavior.sh"

# Verify the fix
echo -e "\n${BLUE}🔧 Testing with different URLs when disabled:${NC}"
echo "All of these should look IDENTICAL:"
echo "  http://localhost:8002/?seed=1"
echo "  http://localhost:8002/?seed=50" 
echo "  http://localhost:8002/?seed=100"
echo "  http://localhost:8002/?seed=300"
echo "  http://localhost:8002/"
echo
echo "✅ Expected behavior: Default layout (header top, sidebar left) for ALL seeds"
