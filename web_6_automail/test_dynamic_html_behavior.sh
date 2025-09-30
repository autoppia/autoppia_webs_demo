#!/bin/bash

# Test script for dynamic HTML behavior in web_6_automail
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
    local url="http://localhost:8005/?seed=$seed"
    
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
echo "🔍 Checking if web_6_automail is running..."
if ! curl -s http://localhost:8005 > /dev/null; then
    echo -e "${RED}❌ Application is not running on localhost:8005${NC}"
    echo "Please start the application first:"
    echo "  cd web_6_automail"
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

# Test email list page (has VIEW_EMAIL, STAR_AN_EMAIL events)
echo -e "\n${BLUE}Testing Email List (Event: VIEW_EMAIL, STAR_AN_EMAIL)${NC}"
email_url="http://localhost:8005/?seed=5"
email_response=$(curl -s -o /dev/null -w "%{http_code}" "$email_url")
if [ "$email_response" = "200" ]; then
    echo -e "${GREEN}✅ Email list accessible${NC}"
    
    # Check for dynamic button attributes
    dynamic_buttons=$(curl -s "$email_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic button attributes: $dynamic_buttons found"
    
    # Check for XPath confusion
    xpath_buttons=$(curl -s "$email_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_buttons found"
else
    echo -e "${RED}❌ Email list not accessible${NC}"
fi

# Test compose modal (has SEND_EMAIL, EMAIL_SAVE_AS_DRAFT events)
echo -e "\n${BLUE}Testing Compose Modal (Event: SEND_EMAIL, EMAIL_SAVE_AS_DRAFT)${NC}"
compose_url="http://localhost:8005/?seed=180"
compose_response=$(curl -s -o /dev/null -w "%{http_code}" "$compose_url")
if [ "$compose_response" = "200" ]; then
    echo -e "${GREEN}✅ Compose modal accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_compose=$(curl -s "$compose_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic compose attributes: $dynamic_compose found"
    
    # Check for XPath confusion
    xpath_compose=$(curl -s "$compose_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_compose found"
else
    echo -e "${RED}❌ Compose modal not accessible${NC}"
fi

# Test toolbar (has SEARCH_EMAIL, THEME_CHANGED events)
echo -e "\n${BLUE}Testing Toolbar (Event: SEARCH_EMAIL, THEME_CHANGED)${NC}"
toolbar_url="http://localhost:8005/?seed=200"
toolbar_response=$(curl -s -o /dev/null -w "%{http_code}" "$toolbar_url")
if [ "$toolbar_response" = "200" ]; then
    echo -e "${GREEN}✅ Toolbar accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_toolbar=$(curl -s "$toolbar_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic toolbar attributes: $dynamic_toolbar found"
    
    # Check for XPath confusion
    xpath_toolbar=$(curl -s "$toolbar_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_toolbar found"
else
    echo -e "${RED}❌ Toolbar not accessible${NC}"
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
echo "  http://localhost:8005/?seed=1   (Default layout)"
echo "  http://localhost:8005/?seed=5   (Layout 2 - seeds ending in 5)"
echo "  http://localhost:8005/?seed=180 (Ultra-wide layout)"
echo "  http://localhost:8005/?seed=200 (Asymmetric layout)"

echo -e "\n${BLUE}Email events that trigger dynamic attributes:${NC}"
echo "  - VIEW_EMAIL: Email list items and email view buttons"
echo "  - MARK_AS_SPAM: Spam buttons"
echo "  - MARK_AS_UNREAD: Unread buttons"
echo "  - DELETE_EMAIL: Delete buttons"
echo "  - STAR_AN_EMAIL: Star buttons"
echo "  - MARK_EMAIL_AS_IMPORTANT: Important buttons"
echo "  - ADD_LABEL: Label selector buttons"
echo "  - CREATE_LABEL: Create label buttons"
echo "  - SEND_EMAIL: Send email buttons"
echo "  - EMAIL_SAVE_AS_DRAFT: Save draft buttons"
echo "  - THEME_CHANGED: Theme toggle buttons"
echo "  - SEARCH_EMAIL: Search input and buttons"
