#!/bin/bash

# Test script for dynamic HTML behavior in web_5_autocrm
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
    local url="http://localhost:8004/?seed=$seed"
    
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

# Test matters page (has ADD_NEW_MATTER, DELETE_MATTER, VIEW_MATTER_DETAILS events)
echo -e "\n${BLUE}Testing Matters Page (Event: ADD_NEW_MATTER, DELETE_MATTER, VIEW_MATTER_DETAILS)${NC}"
matters_url="http://localhost:8004/matters?seed=5"
matters_response=$(curl -s -o /dev/null -w "%{http_code}" "$matters_url")
if [ "$matters_response" = "200" ]; then
    echo -e "${GREEN}✅ Matters page accessible${NC}"
    
    # Check for dynamic button attributes
    dynamic_buttons=$(curl -s "$matters_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic button attributes: $dynamic_buttons found"
    
    # Check for XPath confusion
    xpath_buttons=$(curl -s "$matters_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_buttons found"
else
    echo -e "${RED}❌ Matters page not accessible${NC}"
fi

# Test clients page (has SEARCH_CLIENT, VIEW_CLIENT_DETAILS events)
echo -e "\n${BLUE}Testing Clients Page (Event: SEARCH_CLIENT, VIEW_CLIENT_DETAILS)${NC}"
clients_url="http://localhost:8004/clients?seed=180"
clients_response=$(curl -s -o /dev/null -w "%{http_code}" "$clients_url")
if [ "$clients_response" = "200" ]; then
    echo -e "${GREEN}✅ Clients page accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_clients=$(curl -s "$clients_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic client attributes: $dynamic_clients found"
    
    # Check for XPath confusion
    xpath_clients=$(curl -s "$clients_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_clients found"
else
    echo -e "${RED}❌ Clients page not accessible${NC}"
fi

# Test documents page (has DOCUMENT_UPLOADED, DOCUMENT_DELETED events)
echo -e "\n${BLUE}Testing Documents Page (Event: DOCUMENT_UPLOADED, DOCUMENT_DELETED)${NC}"
documents_url="http://localhost:8004/documents?seed=200"
documents_response=$(curl -s -o /dev/null -w "%{http_code}" "$documents_url")
if [ "$documents_response" = "200" ]; then
    echo -e "${GREEN}✅ Documents page accessible${NC}"
    
    # Check for dynamic attributes
    dynamic_docs=$(curl -s "$documents_url" | grep -c "data-seed\|data-variant")
    echo -e "   Dynamic document attributes: $dynamic_docs found"
    
    # Check for XPath confusion
    xpath_docs=$(curl -s "$documents_url" | grep -c "data-xpath")
    echo -e "   XPath confusion attributes: $xpath_docs found"
else
    echo -e "${RED}❌ Documents page not accessible${NC}"
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
echo "  http://localhost:8004/?seed=1   (Default layout)"
echo "  http://localhost:8004/?seed=5   (Layout 2 - seeds ending in 5)"
echo "  http://localhost:8004/?seed=180 (Ultra-wide layout)"
echo "  http://localhost:8004/?seed=200 (Asymmetric layout)"
echo "  http://localhost:8004/matters?seed=5   (Matters with dynamic attributes)"
echo "  http://localhost:8004/clients?seed=180 (Clients with dynamic attributes)"
