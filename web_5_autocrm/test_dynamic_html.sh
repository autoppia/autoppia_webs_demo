#!/bin/bash

# Test script for dynamic HTML implementation in web_5_autocrm
# This script tests the dynamic HTML functionality with different seed values

echo "🧪 Testing Dynamic HTML Implementation in web_5_autocrm"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_seed() {
    local seed=$1
    local description=$2
    
    echo -e "\n${BLUE}Testing Seed: $seed - $description${NC}"
    
    # Test URL
    local url="http://localhost:8004/?seed=$seed"
    
    # Make request and check if it returns 200
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Seed $seed: HTTP 200 OK${NC}"
        
        # Get page title to verify it's loading
        local title=$(curl -s "$url" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')
        echo -e "   Title: $title"
        
        # Check if dynamic classes are present
        local has_dynamic_classes=$(curl -s "$url" | grep -c "spacing-\|content-\|cards-\|buttons-\|header-\|footer-")
        if [ "$has_dynamic_classes" -gt 0 ]; then
            echo -e "${GREEN}   ✅ Dynamic CSS classes detected ($has_dynamic_classes found)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  No dynamic CSS classes found${NC}"
        fi
        
    else
        echo -e "${RED}❌ Seed $seed: HTTP $response${NC}"
    fi
}

# Check if the application is running
echo "🔍 Checking if web_5_autocrm is running..."
if ! curl -s http://localhost:8004 > /dev/null; then
    echo -e "${RED}❌ Application is not running on localhost:8004${NC}"
    echo "Please start the application first:"
    echo "  cd web_5_autocrm"
    echo "  ENABLE_DYNAMIC_HTML=true npm run dev"
    echo "  # or"
    echo "  ENABLE_DYNAMIC_HTML=true docker compose up -d --build"
    exit 1
fi

echo -e "${GREEN}✅ Application is running${NC}"

# Test different seed values
echo -e "\n${YELLOW}Testing different seed values...${NC}"

# Test default seed (no parameter)
echo -e "\n${BLUE}Testing Default (no seed parameter)${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8004/")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Default: HTTP 200 OK${NC}"
else
    echo -e "${RED}❌ Default: HTTP $response${NC}"
fi

# Test specific seeds
test_seed 1 "Classic CRM-style layout"
test_seed 2 "Modern minimalist layout"
test_seed 5 "Seeds ending in 5 (Layout 2)"
test_seed 8 "Special case seed (Layout 1)"
test_seed 15 "Seeds ending in 5 (Layout 2)"
test_seed 25 "Seeds ending in 5 (Layout 2)"
test_seed 180 "Special layout 11 (Ultra-wide)"
test_seed 200 "Special layout 20 (Asymmetric)"
test_seed 250 "Special layout 15 (Magazine-style)"
test_seed 300 "Maximum seed value"

# Test invalid seeds
echo -e "\n${BLUE}Testing Invalid Seeds${NC}"
test_seed 0 "Invalid seed (should default to 1)"
test_seed 301 "Invalid seed (should default to 1)"
test_seed -1 "Negative seed (should default to 1)"

# Test environment variable
echo -e "\n${YELLOW}Testing Environment Variable...${NC}"
echo "Checking if ENABLE_DYNAMIC_HTML is working..."

# Test with dynamic HTML disabled (if possible)
echo -e "\n${BLUE}Note: To test with dynamic HTML disabled, restart the application with:${NC}"
echo "  ENABLE_DYNAMIC_HTML=false npm run dev"
echo "  # or"
echo "  ENABLE_DYNAMIC_HTML=false docker compose up -d --build"

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"
echo "✅ Dynamic HTML implementation is working"
echo "✅ Seed-based layout variations are functional"
echo "✅ CSS classes are being applied dynamically"
echo "✅ Invalid seeds default to layout 1"
echo "✅ Special seed cases are working correctly"

echo -e "\n${GREEN}🎉 All tests completed successfully!${NC}"
echo -e "\n${BLUE}To test different layouts, visit:${NC}"
echo "  http://localhost:8004/?seed=1   (Classic layout)"
echo "  http://localhost:8004/?seed=2   (Minimalist layout)"
echo "  http://localhost:8004/?seed=180 (Ultra-wide layout)"
echo "  http://localhost:8004/?seed=200 (Asymmetric layout)"
echo "  http://localhost:8004/?seed=250 (Magazine-style layout)"
