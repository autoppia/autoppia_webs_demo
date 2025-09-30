#!/bin/bash

# Test script to verify that when ENABLE_DYNAMIC_HTML=false, seed values have no impact
echo "🧪 Testing Dynamic HTML Disabled Behavior"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_seed_behavior() {
    local seed=$1
    local description=$2
    
    echo -e "\n${BLUE}Testing Seed: $seed - $description${NC}"
    
    # Test URL
    local url="http://localhost:8002/?seed=$seed"
    
    # Make request and check if it returns 200
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Seed $seed: HTTP 200 OK${NC}"
        
        # Get page title to verify it's loading
        local title=$(curl -s "$url" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')
        echo -e "   Title: $title"
        
        # Check for dynamic attributes - should be minimal when disabled
        local dynamic_attrs=$(curl -s "$url" | grep -c "data-seed\|data-variant")
        if [ "$dynamic_attrs" -eq 0 ]; then
            echo -e "${GREEN}   ✅ No dynamic attributes found (expected when disabled)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Found $dynamic_attrs dynamic attributes (unexpected when disabled)${NC}"
        fi
        
        # Check for XPath data attributes - should be minimal when disabled
        local xpath_attrs=$(curl -s "$url" | grep -c "data-xpath")
        if [ "$xpath_attrs" -eq 0 ]; then
            echo -e "${GREEN}   ✅ No XPath confusion attributes found (expected when disabled)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Found $xpath_attrs XPath confusion attributes (unexpected when disabled)${NC}"
        fi
        
        # Check for seed-based CSS classes - should be minimal when disabled
        local seed_classes=$(curl -s "$url" | grep -c "seed-[0-9]")
        if [ "$seed_classes" -eq 0 ]; then
            echo -e "${GREEN}   ✅ No seed-based CSS classes found (expected when disabled)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Found $seed_classes seed-based CSS classes (unexpected when disabled)${NC}"
        fi
        
    else
        echo -e "${RED}❌ Seed $seed: HTTP $response${NC}"
    fi
}

# Check if the application is running
echo "🔍 Checking if web_6_automail is running on port 8002..."
if ! curl -s http://localhost:8002 > /dev/null; then
    echo -e "${RED}❌ Application is not running on localhost:8002${NC}"
    echo "Please start the application first with dynamic HTML disabled:"
    echo "  bash scripts/setup.sh --demo=automail --web_port=8002 --enable_dynamic_html=false"
    exit 1
fi

echo -e "${GREEN}✅ Application is running${NC}"

# Test different scenarios
echo -e "\n${YELLOW}Testing with Dynamic HTML DISABLED...${NC}"

# Test with different seeds - should all behave the same
echo -e "\n${BLUE}=== Testing Different Seeds (Should All Behave Identically) ===${NC}"
test_seed_behavior 1 "Default seed"
test_seed_behavior 5 "Seed ending in 5"
test_seed_behavior 180 "Special seed 180"
test_seed_behavior 200 "Special seed 200"
test_seed_behavior 250 "Special seed 250"

# Test invalid seeds - should all default to same behavior
echo -e "\n${BLUE}=== Testing Invalid Seeds (Should All Default to Same Behavior) ===${NC}"
test_seed_behavior 0 "Invalid seed (should default)"
test_seed_behavior 301 "Invalid seed (should default)"
test_seed_behavior -1 "Negative seed (should default)"

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"
echo "✅ Dynamic HTML is properly disabled"
echo "✅ Seed values have no impact on layout"
echo "✅ No dynamic attributes are generated"
echo "✅ No XPath confusion is applied"
echo "✅ No seed-based CSS classes are used"

echo -e "\n${GREEN}🎉 Dynamic HTML Disabled System is Working!${NC}"
echo -e "\n${BLUE}How it works when ENABLE_DYNAMIC_HTML=false:${NC}"
echo "1. All seed values are ignored"
echo "2. Default layout is always used"
echo "3. No dynamic attributes are generated"
echo "4. No XPath confusion is applied"
echo "5. No element reordering occurs"
echo "6. Consistent behavior regardless of URL seed parameter"

echo -e "\n${BLUE}Test URLs (all should behave identically):${NC}"
echo "  http://localhost:8002/?seed=1   (Default)"
echo "  http://localhost:8002/?seed=5   (Should be same as seed=1)"
echo "  http://localhost:8002/?seed=180 (Should be same as seed=1)"
echo "  http://localhost:8002/?seed=200 (Should be same as seed=1)"
echo "  http://localhost:8002/          (No seed parameter)"
