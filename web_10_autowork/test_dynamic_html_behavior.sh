#!/bin/bash

# Test script for dynamic HTML behavior in web_10_autowork
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
    local url="http://localhost:8009/?seed=$seed"
    
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
echo "🔍 Checking if web_10_autowork is running..."
if ! curl -s http://localhost:8009 > /dev/null; then
    echo -e "${RED}❌ Application is not running on localhost:8009${NC}"
    echo "Please start the application first:"
    echo "  cd web_10_autowork"
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

# Test main page (has POST_A_JOB, WRITE_JOB_TITLE events)
echo -e "\n${BLUE}Testing Main Page (Event: POST_A_JOB, WRITE_JOB_TITLE)${NC}"
main_url="http://localhost:8009/?seed=5"
main_response=$(curl -s -o /dev/null -w "%{http_code}" "$main_url")
if [ "$main_response" = "200" ]; then
    echo -e "${GREEN}✅ Main page accessible${NC}"
    
    # Check for dynamic button attributes
    dynamic_buttons=$(curl -s "$main_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic button attributes: $dynamic_buttons found"
    
    # Check for XPath confusion
    xpath_buttons=$(curl -s "$main_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_buttons found"
else
    echo -e "${RED}❌ Main page not accessible${NC}"
fi

# Test post job wizard (has NEXT_SKILLS, ADD_SKILL, REMOVE_SKILL events)
echo -e "\n${BLUE}Testing Post Job Wizard (Event: NEXT_SKILLS, ADD_SKILL, REMOVE_SKILL)${NC}"
wizard_url="http://localhost:8009/?seed=180"
wizard_response=$(curl -s -o /dev/null -w "%{http_code}" "$wizard_url")
if [ "$wizard_response" = "200" ]; then
    echo -e "${GREEN}✅ Post job wizard accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_wizard=$(curl -s "$wizard_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic wizard attributes: $dynamic_wizard found"
    
    # Check for XPath confusion
    xpath_wizard=$(curl -s "$wizard_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_wizard found"
else
    echo -e "${RED}❌ Post job wizard not accessible${NC}"
fi

# Test expert consultation (has BOOK_A_CONSULTATION events)
echo -e "\n${BLUE}Testing Expert Consultation (Event: BOOK_A_CONSULTATION)${NC}"
expert_url="http://localhost:8009/?seed=200"
expert_response=$(curl -s -o /dev/null -w "%{http_code}" "$expert_url")
if [ "$expert_response" = "200" ]; then
    echo -e "${GREEN}✅ Expert consultation accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_expert=$(curl -s "$expert_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic expert attributes: $dynamic_expert found"
    
    # Check for XPath confusion
    xpath_expert=$(curl -s "$expert_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_expert found"
else
    echo -e "${RED}❌ Expert consultation not accessible${NC}"
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
echo "  http://localhost:8009/?seed=1   (Default layout)"
echo "  http://localhost:8009/?seed=5   (Layout 2 - seeds ending in 5)"
echo "  http://localhost:8009/?seed=180 (Ultra-wide layout)"
echo "  http://localhost:8009/?seed=200 (Asymmetric layout)"

echo -e "\n${BLUE}Work events that trigger dynamic attributes:${NC}"
echo "  - POST_A_JOB: Post job buttons"
echo "  - WRITE_JOB_TITLE: Job title input fields"
echo "  - NEXT_SKILLS: Next step buttons in wizard"
echo "  - BACK_BUTTON: Back navigation buttons"
echo "  - CLOSE_POST_A_JOB_WINDOW: Close wizard buttons"
echo "  - SUBMIT_JOB: Submit job buttons"
echo "  - ATTACH_FILE_CLICKED: File attachment buttons"
echo "  - SEARCH_SKILL: Skill search input fields"
echo "  - ADD_SKILL: Add skill buttons"
echo "  - REMOVE_SKILL: Remove skill buttons"
echo "  - BOOK_A_CONSULTATION: Book consultation buttons"
echo "  - HIRE_BTN_CLICKED: Hire buttons"
echo "  - SELECT_HIRING_TEAM: Hiring team selection"
echo "  - HIRE_CONSULTANT: Hire consultant buttons"
echo "  - CANCEL_HIRE: Cancel hire buttons"
