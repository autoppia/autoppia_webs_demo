#!/bin/bash

# Toggle test script for Dynamic HTML Structure
# This script helps test both enabled and disabled states

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Dynamic HTML Structure Toggle Test Suite     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Function to show current status
show_status() {
    echo -e "${YELLOW}Current Environment Variable:${NC}"
    echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=${NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE:-not set}"
    echo ""
    if [ "${NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE}" = "false" ]; then
        echo -e "${RED}Status: DISABLED${NC} - seed-structure parameter will be ignored"
    else
        echo -e "${GREEN}Status: ENABLED${NC} - seed-structure parameter will change content"
    fi
    echo ""
}

# Function to run enabled tests
test_enabled() {
    echo -e "${BLUE}════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Testing ENABLED State${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════${NC}"
    echo ""
    
    echo "To test enabled state, run:"
    echo -e "${GREEN}  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev${NC}"
    echo ""
    echo "Then in another terminal, run:"
    echo -e "${GREEN}  bash scripts/test_dynamic_structure_enabled.sh${NC}"
    echo ""
}

# Function to run disabled tests
test_disabled() {
    echo -e "${BLUE}════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Testing DISABLED State${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════${NC}"
    echo ""
    
    echo "To test disabled state, run:"
    echo -e "${GREEN}  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev${NC}"
    echo ""
    echo "Then in another terminal, run:"
    echo -e "${GREEN}  bash scripts/test_dynamic_structure_disabled.sh${NC}"
    echo ""
}

# Main menu
echo -e "${YELLOW}What would you like to test?${NC}"
echo ""
echo "  1) Test with dynamic structure ENABLED"
echo "  2) Test with dynamic structure DISABLED"
echo "  3) Show current environment variable status"
echo "  4) Quick reference guide"
echo "  5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        test_enabled
        ;;
    2)
        test_disabled
        ;;
    3)
        show_status
        ;;
    4)
        echo ""
        echo -e "${CYAN}════════════════════════════════════════════════${NC}"
        echo -e "${CYAN}  Quick Reference Guide${NC}"
        echo -e "${CYAN}════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${YELLOW}Environment Variable:${NC}"
        echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true   → Dynamic structure enabled"
        echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false  → Dynamic structure disabled"
        echo "  (not set)                                   → Defaults to enabled"
        echo ""
        echo -e "${YELLOW}When ENABLED:${NC}"
        echo "  • seed-structure=1   → Variation 1: 'Dashboard', 'Clients'"
        echo "  • seed-structure=2   → Variation 2: 'Control Panel', 'Customer Base'"
        echo "  • seed-structure=10  → Variation 10: 'Mission Control', 'Stakeholder Hub'"
        echo "  • seed-structure=11  → Variation 1 (cycles back)"
        echo "  • Formula: ((seed - 1) % 10) + 1"
        echo ""
        echo -e "${YELLOW}When DISABLED:${NC}"
        echo "  • All seeds ignored"
        echo "  • Always uses variation 1"
        echo "  • seed-structure=1, 2, 10, 100 → All show 'Dashboard', 'Clients'"
        echo ""
        echo -e "${YELLOW}Test URLs:${NC}"
        echo "  http://localhost:3000/?seed-structure=1"
        echo "  http://localhost:3000/?seed-structure=2"
        echo "  http://localhost:3000/clients?seed-structure=50"
        echo ""
        echo -e "${YELLOW}How to Start:${NC}"
        echo "  # Enabled"
        echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=true npm run dev"
        echo ""
        echo "  # Disabled"
        echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=false npm run dev"
        echo ""
        echo -e "${YELLOW}Test Scripts:${NC}"
        echo "  bash scripts/test_dynamic_structure_enabled.sh   → Test enabled state"
        echo "  bash scripts/test_dynamic_structure_disabled.sh  → Test disabled state"
        echo ""
        ;;
    5)
        echo ""
        echo "Exiting..."
        echo ""
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}Invalid choice${NC}"
        echo ""
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Documentation${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""
echo "For more information, see:"
echo "  • DYNAMIC_HTML_STRUCTURE_README.md"
echo "  • docs/DYNAMIC_STRUCTURE_GUIDE.md"
echo "  • docs/COMPLETE_GUIDE.md"
echo ""

