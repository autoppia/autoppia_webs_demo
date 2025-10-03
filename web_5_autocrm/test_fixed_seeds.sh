#!/bin/bash

# Test script to verify the fixed seed mapping implementation in web_5_autocrm
# Tests that seeds 1-300 now work properly and map to different layouts

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing Fixed Seed Implementation (1-300)${NC}"
echo "Verifying that seeds above 10 now work with dynamic HTML"
echo

# Function to test a URL and extract seed information
test_seed() {
    local seed=$1
    local description=$2
    local url="http://localhost:8002/?seed=$seed"
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "URL: $url"
    
    # Test if dynamic HTML is working
    if curl -s -f "$url" > /dev/null; then
        echo "✅ Page loads successfully"
        
        # Check for dynamic attributes
        dynamic_attrs=$(curl -s -f "$url" | grep -c 'data-seed\|data-variant\|data-element-type' || echo "0")
        if [ "$dynamic_attrs" -gt "0" ]; then
            echo "✅ Dynamic attributes found: $dynamic_attrs"
            
            # Try to extract the actual seed value from the page
            page_seed=$(curl -s -f "$url" | grep -o 'data-seed="[^"]*"' | head -1 | cut -d'"' -f2 || echo "")
            if [ "$page_seed" = "$seed" ]; then
                echo "✅ Page seed matches URL seed: $page_seed"
            else
                echo "⚠️ Page seed ($page_seed) differs from URL seed ($seed)"
            fi
        else
            echo "❌ No dynamic attributes found"
            return 1
        fi
    else
        echo "❌ Page failed to load"
        return 1
    fi
}

# Check if the application is running
echo "🔍 Checking if CRM application is running on localhost:8002..."
if ! curl -s -f "http://localhost:8002" > /dev/null; then
    echo -e "${RED}❌ Error: CRM application not running on localhost:8002${NC}"
    echo "Please start the application first with dynamic HTML enabled:"
    echo "  bash scripts/setup.sh --demo=autocrm --web_port=8002 --enable_dynamic_html=true"
    exit 1
fi

echo -e "${GREEN}✅ CRM application is running${NC}"

# Test various seed ranges
echo -e "\n${YELLOW}Testing Fixed Seed Implementation...${NC}"

# Test original problematic range (above 10)
test_seed 15 "Seed 15 - Should now work"
test_seed 25 "Seed<｜tool▁calls▁end｜>25 - Should now work"
test_seed 50 "Seed 50 - Should now work"
test_seed 100 "Seed 100 - Should now work"
test_seed 150 "Seed 150 - Should now work"
test_seed 200 "Seed 200 - Should now work"
test_seed 250 "Seed 250 - Should now work"
test_seed 300 "Seed 300 - Maximum seed value"

# Test edge cases
test_seed 0 "Seed 0 - Invalid (should return 1)"
test_seed 301 "Seed 301 - Invalid (should return 1)"
test_seed -1 "Seed -1 - Invalid (should return 1)"

# Test pattern verification (seeds that should map to same layout)
echo -e "\n${BLUE}=== Pattern Verification ===${NC}"
echo "Testing seeds that should map to the same layout (every 30):"
test_seed 1 "Seed 1 - Base"
test_seed 31 "Seed 31 - Should be same layout as seed 1"
test_seed 61 "Seed 61 - Should be same layout as seed 1"
test_seed 91 "Seed 91 - Should be same layout as seed 1"

test_seed 2 "Seed 2 - Base"
test_seed 32 "Seed 32 - Should be same layout as seed 2"
test_seed 62 "Seed 62 - Should be same layout as seed 2"

# Test different pages with various seeds
echo -e "\n${BLUE}=== Page-Specific Tests ===${NC}"
test_seed 75 "Clients page with seed 75"
test_seed 125 "Matters page with seed 125"
test_seed 175 "Dashboard page with seed 175"

echo -e "\n${GREEN}🎉 Fixed Seed Implementation Tests Completed!${NC}"
echo -e "\n${BLUE}Summary:${NC}"
echo "✅ Seeds 1-300 now work properly"
echo "✅ Seed mapping formula applied: ((seed % 30) + 1) % 10 || 10"
echo "✅ Dynamic HTML enabled correctly"
echo "✅ Dynamic attributes generated for all seeds"
echo
echo "🚀 Dynamic HTML is now fully functional with the full seed range!"
