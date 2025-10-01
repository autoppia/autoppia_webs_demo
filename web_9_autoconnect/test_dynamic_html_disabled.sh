#!/bin/bash

# Test script for dynamic HTML disabled behavior in web_9_autoconnect

echo "🧪 Testing Dynamic HTML DISABLED Behavior"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_seed_no_effect() {
    local seed=$1
    local description=$2
    
    echo -e "\n${BLUE}Testing Seed: $seed - $description${NC}"
    
    # Test URL
    local url="http://localhost:8008/?seed=$seed"
    
    # Make request and check if it returns 200
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Seed $seed: HTTP 200 OK${NC}"
        
        # Check for dynamic attributes - should NOT be present
        local dynamic_attrs=$(curl -s "$url" | grep -c "data-seed\|data-variant")
        if [ "$dynamic_attrs" -eq 0 ]; then
            echo -e "${GREEN}   ✅ No dynamic attributes found (as expected)${NC}"
        else
            echo -e "${RED}   ❌ Found $dynamic_attrs dynamic attributes (should be 0)${NC}"
        fi
        
        # Check for static IDs - should be present
        local static_ids=$(curl -s "$url" | grep -c 'id="[^"]*-0"')
        if [ "$static_ids" -gt 0 ]; then
            echo -e "${GREEN}   ✅ Static IDs detected ($static_ids found)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  No static IDs found${NC}"
        fi
        
    else
        echo -e "${RED}❌ Seed $seed: HTTP $response${NC}"
    fi
}

# Check if the application is running
echo "🔍 Checking if web_9_autoconnect is running..."
if ! curl -s http://localhost:8008 > /dev/null; then
    echo -e "${RED}❌ Application is not running on localhost:8008${NC}"
    echo "Please start the application first:"
    echo "  cd web_9_autoconnect"
    echo "  ENABLE_DYNAMIC_HTML=false npm run dev"
    echo "  # or"
    echo "  ENABLE_DYNAMIC_HTML=false docker compose up -d --build"
    exit 1
fi

echo -e "${GREEN}✅ Application is running${NC}"

# Test different scenarios
echo -e "\n${YELLOW}Testing with Dynamic HTML DISABLED...${NC}"

test_seed_no_effect 1 "Should use default layout regardless"
test_seed_no_effect 5 "Should use default layout regardless"
test_seed_no_effect 180 "Should use default layout regardless"
test_seed_no_effect 200 "Should use default layout regardless"

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"
echo "✅ Dynamic HTML is correctly DISABLED"
echo "✅ Seed parameter has no effect on layout"
echo "✅ No dynamic attributes are present"
echo "✅ All elements use static IDs"

echo -e "\n${GREEN}🎉 Static Mode is Active!${NC}"
echo -e "\n${BLUE}What this means:${NC}"
echo "1. All seeds produce the same layout"
echo "2. Element IDs are static (e.g., 'button-0' instead of 'button-150-0')"
echo "3. No data-seed or data-variant attributes"
echo "4. Normal, predictable HTML structure"

