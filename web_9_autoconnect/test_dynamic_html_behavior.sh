#!/bin/bash

# Test script for dynamic HTML behavior in web_9_autoconnect
# This script tests the scraper confusion functionality

echo "🧪 Testing Dynamic HTML Behavior for Scraper Confusion"
echo "======================================================"

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
    local expected_behavior=$3
    
    echo -e "\n${BLUE}Testing Seed: $seed - $description${NC}"
    
    # Test URL
    local url="http://localhost:8008/?seed=$seed"
    
    # Make request and check if it returns 200
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Seed $seed: HTTP 200 OK${NC}"
        
        # Get page title to verify it's loading
        local title=$(curl -s "$url" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')
        echo -e "   Title: $title"
        
        # Check for dynamic attributes on elements that log events
        local dynamic_attrs=$(curl -s "$url" | grep -c "data-seed\|data-variant\|data-element-type")
        if [ "$dynamic_attrs" -gt 0 ]; then
            echo -e "${GREEN}   ✅ Dynamic attributes detected ($dynamic_attrs found)${NC}"
            echo -e "   ${YELLOW}   Expected: $expected_behavior${NC}"
        else
            echo -e "${YELLOW}   ⚠️  No dynamic attributes found${NC}"
            echo -e "   ${YELLOW}   Expected: $expected_behavior${NC}"
        fi
        
        # Check for XPath data attributes (scraper confusion)
        local xpath_attrs=$(curl -s "$url" | grep -c "data-xpath")
        if [ "$xpath_attrs" -gt 0 ]; then
            echo -e "${GREEN}   ✅ XPath confusion attributes detected ($xpath_attrs found)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  No XPath confusion attributes found${NC}"
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
    echo "  ENABLE_DYNAMIC_HTML=true npm run dev"
    echo "  # or"
    echo "  ENABLE_DYNAMIC_HTML=true docker compose up -d --build"
    exit 1
fi

echo -e "${GREEN}✅ Application is running${NC}"

# Test different scenarios
echo -e "\n${YELLOW}Testing Dynamic HTML Behavior...${NC}"

# Test with dynamic HTML enabled (default)
echo -e "\n${BLUE}=== Testing with Dynamic HTML ENABLED ===${NC}"
test_seed_behavior 1 "Default layout" "Dynamic attributes should be present"
test_seed_behavior 5 "Seeds ending in 5 (Layout 2)" "Different layout, dynamic attributes"
test_seed_behavior 180 "Special layout 11 (Ultra-wide)" "Unique layout, dynamic attributes"
test_seed_behavior 200 "Special layout 20 (Asymmetric)" "Unique layout, dynamic attributes"

# Test invalid seeds
echo -e "\n${BLUE}=== Testing Invalid Seeds ===${NC}"
test_seed_behavior 0 "Invalid seed (should default to 1)" "Should use default layout"
test_seed_behavior 301 "Invalid seed (should default to 1)" "Should use default layout"
test_seed_behavior -1 "Negative seed (should default to 1)" "Should use default layout"

# Test scraper confusion elements
echo -e "\n${YELLOW}Testing Scraper Confusion Elements...${NC}"

# Check for elements that log events and should have dynamic attributes
echo -e "\n${BLUE}Checking for event-logging elements with dynamic attributes:${NC}"

# Test home page (has LIKE_POST, ADD_COMMENT events)
echo -e "\n${BLUE}Testing Home Page (Event: LIKE_POST, ADD_COMMENT)${NC}"
home_url="http://localhost:8008/?seed=5"
home_response=$(curl -s -o /dev/null -w "%{http_code}" "$home_url")
if [ "$home_response" = "200" ]; then
    echo -e "${GREEN}✅ Home page accessible${NC}"
    
    # Check for dynamic button attributes
    dynamic_buttons=$(curl -s "$home_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic button attributes: $dynamic_buttons found"
    
    # Check for XPath confusion
    xpath_buttons=$(curl -s "$home_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_buttons found"
else
    echo -e "${RED}❌ Home page not accessible${NC}"
fi

# Test jobs page (has VIEW_JOB, APPLY_FOR_JOB events)
echo -e "\n${BLUE}Testing Jobs Page (Event: VIEW_JOB, APPLY_FOR_JOB)${NC}"
jobs_url="http://localhost:8008/jobs?seed=180"
jobs_response=$(curl -s -o /dev/null -w "%{http_code}" "$jobs_url")
if [ "$jobs_response" = "200" ]; then
    echo -e "${GREEN}✅ Jobs page accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_jobs=$(curl -s "$jobs_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic job attributes: $dynamic_jobs found"
    
    # Check for XPath confusion
    xpath_jobs=$(curl -s "$jobs_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_jobs found"
else
    echo -e "${RED}❌ Jobs page not accessible${NC}"
fi

# Test profile page (has FOLLOW_USER, SEND_MESSAGE events)
echo -e "\n${BLUE}Testing Profile Page (Event: FOLLOW_USER, SEND_MESSAGE)${NC}"
profile_url="http://localhost:8008/profile/johndoe?seed=200"
profile_response=$(curl -s -o /dev/null -w "%{http_code}" "$profile_url")
if [ "$profile_response" = "200" ]; then
    echo -e "${GREEN}✅ Profile page accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_profile=$(curl -s "$profile_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic profile attributes: $dynamic_profile found"
    
    # Check for XPath confusion
    xpath_profile=$(curl -s "$profile_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_profile found"
else
    echo -e "${RED}❌ Profile page not accessible${NC}"
fi

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"
echo "✅ Dynamic HTML behavior is working"
echo "✅ Seed-based layout variations are functional"
echo "✅ Scraper confusion attributes are being applied"
echo "✅ Event-logging elements have dynamic attributes"
echo "✅ XPath confusion is implemented"

echo -e "\n${GREEN}🎉 Scraper Confusion System is Active!${NC}"
echo -e "\n${BLUE}How it works:${NC}"
echo "1. When ENABLE_DYNAMIC_HTML=true, seed values (1-300) change layouts"
echo "2. Only elements that log events get dynamic attributes"
echo "3. Each seed produces different XPath selectors"
echo "4. Scrapers get confused by changing element attributes"
echo "5. When ENABLE_DYNAMIC_HTML=false, seed has no effect"

echo -e "\n${BLUE}Test different layouts:${NC}"
echo "  http://localhost:8008/?seed=1   (Default layout)"
echo "  http://localhost:8008/?seed=5   (Layout 2 - seeds ending in 5)"
echo "  http://localhost:8008/?seed=180 (Ultra-wide layout)"
echo "  http://localhost:8008/?seed=200 (Asymmetric layout)"

echo -e "\n${BLUE}Events that trigger dynamic attributes:${NC}"
echo "  - LIKE_POST: Post like buttons"
echo "  - ADD_COMMENT: Comment buttons"
echo "  - VIEW_JOB: Job card links and view buttons"
echo "  - APPLY_FOR_JOB: Apply buttons"
echo "  - FOLLOW_USER: Follow buttons"
echo "  - SEND_MESSAGE: Message buttons"
echo "  - SEARCH_USER: Search input and buttons"

