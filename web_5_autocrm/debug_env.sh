#!/bin/bash

# Debug script to check environment variables in web_5_autocrm container

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Debugging Environment Variables${NC}"
echo "Checking if dynamic HTML environment variables are set correctly"
echo

# Function to check container environment
check_container_env() {
    local container_name=$1
    
    echo -e "${BLUE}Checking container: $container_name${NC}"
    
    if docker ps | grep -q "$container_name"; then
        echo "✅ Container is running"
        
        echo -e "\n${YELLOW}Environment Variables:${NC}"
        docker exec "$container_name" printenv | grep "DYNAMIC_HTML\|NODE_ENV" | sort
        
        echo -e "\n${YELLOW}Build Arguments:${NC}"
        docker inspect "$container_name" | grep -A 10 '"Args"' || echo "No build args found"
        
    else
        echo "❌ Container '$container_name' not found"
        echo "Available containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep autocrm || echo "No autocrm containers found"
    fi
}

# Try different possible container names
container_names=("autocrm_8002-web-1" "autocrm_8004-web-1" "autocrm_8080-web-1")

for container_name in "${container_names[@]}"; do
    if docker ps | grep -q "$container_name"; then
        check_container_env "$container_name"
        echo -e "\n${GREEN}✅ Found and checked container: $container_name${NC}"
        break
    fi
done

# Check docker-compose file
echo -e "\n${BLUE}=== Docker Compose Configuration ===${NC}"
if [ -f "docker-compose.yml" ]; then
    echo "📄 docker-compose.yml contents:"
    grep -A 10 -B 5 "ENABLE_DYNAMIC_HTML" docker-compose.yml || echo "No dynamic HTML config found"
else
    echo "❌ docker-compose.yml not found"
fi

# Check Dockerfile
echo -e "\n${BLUE}=== Dockerfile Configuration ===${NC}"
if [ -f "Dockerfile" ]; then
    echo "📄 Dockerfile build section:"
    grep -A 10 -B 5 "ENABLE_DYNAMIC_HTML\|ARG\|ENV" Dockerfile || echo "No build args found"
else
    echo "❌ Dockerfile not found"
fi

# Manual test instructions
echo -e "\n${BLUE}=== Manual Testing Instructions ===${NC}"
echo "To test if dynamic HTML is working:"
echo "1. Visit: http://localhost:8002/?seed=1"
echo "2. Open browser DevTools"
echo "3. Inspect any button or element"
echo "4. Look for attributes: data-seed, data-variant, data-element-type"
echo "5. Try different seeds: ?seed=50, ?seed=100, ?seed=200"
echo
echo "Expected results when ENABLE_DYNAMIC_HTML=true:"
echo "- Elements should have different IDs based on seed"
echo "- Elements should have data-seed attributes"
echo "- Layout should change between different seeds"
echo "- CSS classes should include seed-specific patterns"
