#!/bin/bash

# Test script for Dynamic HTML in web_2_demo_books

echo "========================================="
echo "Dynamic HTML Test Script"
echo "========================================="
echo ""

cd /home/rev/autoppia_webs_demo/web_2_demo_books

echo "1. Checking if docker compose is available..."
if command -v docker &> /dev/null; then
    echo "   ✅ Docker found"
else
    echo "   ❌ Docker not found"
    exit 1
fi

echo ""
echo "2. Checking if containers are running..."
RUNNING=$(docker compose ps --services --filter "status=running" | wc -l)
if [ "$RUNNING" -gt 0 ]; then
    echo "   ✅ $RUNNING container(s) running"
else
    echo "   ⚠️  No containers running. Starting them..."
    docker compose up -d --build
    echo "   Waiting 10 seconds for startup..."
    sleep 10
fi

echo ""
echo "3. Checking ENABLE_DYNAMIC_HTML environment variable..."
ENV_VAR=$(docker compose exec -T web env | grep ENABLE_DYNAMIC_HTML || echo "not found")
if [[ "$ENV_VAR" == *"true"* ]]; then
    echo "   ✅ ENABLE_DYNAMIC_HTML=true"
elif [[ "$ENV_VAR" == *"false"* ]]; then
    echo "   ❌ ENABLE_DYNAMIC_HTML=false"
    echo "   Fix: Set ENABLE_DYNAMIC_HTML=true in docker-compose.yml"
else
    echo "   ❌ Variable not found: $ENV_VAR"
fi

echo ""
echo "4. Testing web server response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/ 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Server responding (HTTP $HTTP_CODE)"
else
    echo "   ❌ Server not responding (HTTP $HTTP_CODE)"
    echo "   Check if containers are running: docker compose ps"
    exit 1
fi

echo ""
echo "5. Testing dynamic HTML with seed=1..."
RESPONSE1=$(curl -s "http://localhost:8001/?seed=1")
if echo "$RESPONSE1" | grep -q 'data-seed="1"'; then
    echo "   ✅ Found data-seed=\"1\" in response"
    COUNT1=$(echo "$RESPONSE1" | grep -o 'data-seed="1"' | wc -l)
    echo "   ℹ️  Found $COUNT1 elements with data-seed=\"1\""
else
    echo "   ❌ data-seed not found in response"
    echo "   Checking if JavaScript is loaded..."
    if echo "$RESPONSE1" | grep -q 'dynamic_layout.js'; then
        echo "      ✅ dynamic_layout.js is included in HTML"
    else
        echo "      ❌ dynamic_layout.js NOT included in HTML"
    fi
    
    echo "   Checking window variables..."
    if echo "$RESPONSE1" | grep -q '__DYNAMIC_HTML_ENABLED__'; then
        echo "      ✅ window.__DYNAMIC_HTML_ENABLED__ is set"
        if echo "$RESPONSE1" | grep -q '__DYNAMIC_HTML_ENABLED__ = true'; then
            echo "      ✅ Set to true"
        else
            echo "      ❌ Set to false"
        fi
    else
        echo "      ❌ window.__DYNAMIC_HTML_ENABLED__ NOT found"
    fi
fi

echo ""
echo "6. Testing dynamic HTML with seed=100..."
RESPONSE100=$(curl -s "http://localhost:8001/?seed=100")
if echo "$RESPONSE100" | grep -q 'data-seed="100"'; then
    echo "   ✅ Found data-seed=\"100\" in response"
    COUNT100=$(echo "$RESPONSE100" | grep -o 'data-seed="100"' | wc -l)
    echo "   ℹ️  Found $COUNT100 elements with data-seed=\"100\""
else
    echo "   ❌ data-seed not found in response"
fi

echo ""
echo "7. Checking if seed changes element order..."
# Extract first 5 navbar items from each seed
NAV1=$(echo "$RESPONSE1" | grep -A 20 'navbar-nav' | grep -o '<a class="nav-link"[^>]*>[^<]*</a>' | head -5)
NAV100=$(echo "$RESPONSE100" | grep -A 20 'navbar-nav' | grep -o '<a class="nav-link"[^>]*>[^<]*</a>' | head -5)

if [ "$NAV1" = "$NAV100" ]; then
    echo "   ⚠️  Navbar order is SAME for both seeds (elements might not be reordering)"
else
    echo "   ✅ Navbar order is DIFFERENT for different seeds"
fi

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo ""
echo "To test in browser, visit:"
echo "  http://localhost:8001/?seed=1"
echo "  http://localhost:8001/?seed=50"
echo "  http://localhost:8001/?seed=100"
echo ""
echo "In browser console, check:"
echo "  console.log(window.__DYNAMIC_HTML_ENABLED__);"
echo "  console.log(window.__INITIAL_SEED__);"
echo "  console.log(document.querySelectorAll('[data-seed]').length);"
echo ""
echo "If elements are not reordering:"
echo "  1. Check browser console for JavaScript errors"
echo "  2. Hard refresh (Ctrl+Shift+R)"
echo "  3. Clear browser cache"
echo "  4. Rebuild containers: docker compose down && docker compose up -d --build"
echo ""

