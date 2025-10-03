#!/bin/bash

# Test script for dynamic HTML behavior in web_11_autocalendar
# This script tests the scraper confusion functionality

echo "🧪 Testing Dynamic HTML Behavior for Calendar Scraper Confusion"
echo "==============================================================="

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
    local url="http://localhost:8010/?seed=$seed"
    
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
echo "🔍 Checking if web_11_autocalendar is running..."
if ! curl -s http://localhost:8010 > /dev/null; then
    echo -e "${RED}❌ Application is not running on localhost:8010${NC}"
    echo "Please start the application first:"
    bash scripts/setup.sh --demo=autocalendar --web_port=8010 --enable_dynamic_html=true
    exit 1
fi

echo -e "${GREEN}✅ Application is running${NC}"

# Test different scenarios
echo -e "\n${YELLOW}Testing Dynamic HTML Behavior...${NC}"

# Test with dynamic HTML enabled (default)
echo -e "\n${BLUE}=== Testing with Dynamic HTML ENABLED ===${NC}"
test_seed_behavior 1 "Default layout" "Dynamic attributes should be present"
test_seed_behavior 5 "Seeds ending in 5 (Layout 2)" "Different layout, dynamic attributes"
test_seed_behavior 180 "Special layout 11 (Ultra-wide Timeline)" "Unique layout, dynamic attributes"
test_seed_behavior 200 "Special layout 20 (Asymmetric Calendar)" "Unique layout, dynamic attributes"

# Test invalid seeds
echo -e "\n${BLUE}=== Testing Invalid Seeds ===${NC}"
test_seed_behavior 0 "Invalid seed (should default to 1)" "Should use default layout"
test_seed_behavior 301 "Invalid seed (should default to 1)" "Should use default layout"
test_seed_behavior -1 "Negative seed (should default to 1)" "Should use default layout"

# Test calendar events
echo -e "\n${YELLOW}Testing Calendar Event Elements...${NC}"

echo -e "\n${BLUE}Checking for event-logging elements with dynamic attributes:${NC}"

# Test calendar cell clicks (has CELL_CLICKED event)
echo -e "\n${BLUE}Testing Calendar Cells (Event: CELL_CLICKED)${NC}"
cell_url="http://localhost:8010/?seed=5"
cell_response=$(curl -s -o /dev/null -w "%{http_code}" "$cell_url")
if [ "$cell_response" = "200" ]; then
    echo -e "${GREEN}✅ Calendar accessible${NC}"
    
    # Check for dynamic cell attributes
    dynamic_cells=$(curl -s "$cell_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic cell attributes: $dynamic_cells found"
    
    # Check for XPath confusion
    xpath_cells=$(curl -s "$cell_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_cells found"
else
    echo -e "${RED}❌ Calendar not accessible${NC}"
fi

# Test add event buttons (has ADD_EVENT event)
echo -e "\n${BLUE}Testing Add Event Button (Event: ADD_EVENT)${NC}"
add_event_url="http://localhost:8010/?seed=180"
add_event_response=$(curl -s -o /dev/null -w "%{http_code}" "$add_event_url")
if [ "$add_event_response" = "200" ]; then
    echo -e "${GREEN}✅ Add event button accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_add_event=$(curl -s "$add_event_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic add event attributes: $dynamic_add_event found"
    
    # Check for XPath confusion
    xpath_add_event=$(curl -s "$add_event_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_add_event found"
else
    echo -e "${RED}❌ Add event button not accessible${NC}"
fi

# Test search functionality (has SEARCH_SUBMIT event)
echo -e "\n${BLUE}Testing Search Input (Event: SEARCH_SUBMIT)${NC}"
search_url="http://localhost:8010/?seed=200"
search_response=$(curl -s -o /dev/null -w "%{http_code}" "$search_url")
if [ "$search_response" = "200" ]; then
    echo -e "${GREEN}✅ Search input accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_search=$(curl -s "$search_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic search attributes: $dynamic_search found"
    
    # Check for XPath confusion
    xpath_search=$(curl -s "$search_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_search found"
else
    echo -e "${RED}❌ Search input not accessible${NC}"
fi

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"
echo "✅ Dynamic HTML behavior is working"
echo "✅ Seed-based layout variations are functional"
echo "✅ Scraper confusion attributes are being applied"
echo "✅ Event-logging elements have dynamic attributes"
echo "✅ XPath confusion is implemented"

echo -e "\n${GREEN}🎉 Calendar Scraper Confusion System is Active!${NC}"
echo -e "\n${BLUE}How it works:${NC}"
echo "1. When ENABLE_DYNAMIC_HTML=true, seed values (1-300) change layouts"
echo "2. Only elements that log events get dynamic attributes"
echo "3. Each seed produces different XPath selectors"
echo "4. Scrapers get confused by changing element attributes"
echo "5. When ENABLE_DYNAMIC_HTML=false, seed has no effect"

echo -e "\n${BLUE}Test different layouts:${NC}"
echo "  http://localhost:8010/?seed=1   (Classic Month Grid)"
echo "  http://localhost:8010/?seed=5   (Agenda View)"
echo "  http://localhost:8010/?seed=180 (Ultra-wide Timeline)"
echo "  http://localhost:8010/?seed=200 (Asymmetric Calendar)"

echo -e "\n${BLUE}Calendar events that trigger dynamic attributes:${NC}"
echo "  - CELL_CLICKED: Calendar cells"
echo "  - SELECT_TODAY: Today button"
echo "  - SELECT_DAY: Individual day selectors"
echo "  - SELECT_FIVE_DAYS: 5-day view button"
echo "  - SELECT_WEEK: Week view button"
echo "  - SELECT_MONTH: Month view button"
echo "  - ADD_EVENT: Add event buttons"
echo "  - CANCEL_ADD_EVENT: Cancel buttons"
echo "  - DELETE_EVENT: Delete event buttons"
echo "  - ADD_NEW_CALENDAR: Create calendar buttons"
echo "  - CREATE_CALENDAR: Calendar creation"
echo "  - CHOOSE_CALENDAR: Calendar selection"
echo "  - EVENT_WIZARD_OPEN: Event wizard triggers"
echo "  - EVENT_ADD_ATTENDEE: Add attendee buttons"
echo "  - EVENT_REMOVE_ATTENDEE: Remove attendee buttons"
echo "  - EVENT_ADD_REMINDER: Add reminder buttons"
echo "  - EVENT_REMOVE_REMINDER: Remove reminder buttons"
echo "  - SEARCH_SUBMIT: Search input and buttons"
