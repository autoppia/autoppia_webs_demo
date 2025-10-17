#!/bin/bash
# Quick verification script for dynamic HTML

echo "========================================="
echo "  Dynamic HTML Verification Script"
echo "========================================="
echo ""

# 1. Check if container is running
echo "1. Checking container status..."
CONTAINER=$(docker ps --filter "name=books" --format "{{.Names}}" | head -1)
if [ -z "$CONTAINER" ]; then
    echo "   ❌ No books container found running"
    echo "   Run: ./scripts/setup.sh --demo=books --enable_dynamic_html=true"
    exit 1
else
    echo "   ✅ Container found: $CONTAINER"
fi
echo ""

# 2. Check environment variable in container
echo "2. Checking ENABLE_DYNAMIC_HTML environment variable..."
ENV_VAR=$(docker exec $CONTAINER env | grep ENABLE_DYNAMIC_HTML)
echo "   $ENV_VAR"
if echo "$ENV_VAR" | grep -q "true"; then
    echo "   ✅ Dynamic HTML is ENABLED"
else
    echo "   ❌ Dynamic HTML is DISABLED"
    echo "   Fix: ./scripts/setup.sh --demo=books --enable_dynamic_html=true"
fi
echo ""

# 3. Check Django setting
echo "3. Checking Django DYNAMIC_HTML_ENABLED setting..."
DJANGO_SETTING=$(docker exec $CONTAINER python -c "from django.conf import settings; print(settings.DYNAMIC_HTML_ENABLED)" 2>&1)
echo "   DYNAMIC_HTML_ENABLED = $DJANGO_SETTING"
if [ "$DJANGO_SETTING" = "True" ]; then
    echo "   ✅ Django setting is True"
else
    echo "   ❌ Django setting is False or error"
fi
echo ""

# 4. Test seed mapping
echo "4. Testing seed mapping..."
SEED_TEST=$(docker exec $CONTAINER python -c "
from booksapp.utils import get_seed_layout
layouts = {}
for seed in [1, 2, 5, 42, 165]:
    config = get_seed_layout(seed)
    layouts[seed] = config.get('layout_id', 'N/A')
print('Seed 1 → Layout', layouts[1])
print('Seed 2 → Layout', layouts[2])
print('Seed 5 → Layout', layouts[5], '(should be 2 - special case)')
print('Seed 42 → Layout', layouts[42])
print('Seed 165 → Layout', layouts[165], '(should be 3 - special case)')
" 2>&1)
echo "$SEED_TEST"
echo ""

# 5. Test HTTP response
echo "5. Testing HTTP responses with different seeds..."
PORT=$(docker port $CONTAINER 8001 2>/dev/null | cut -d: -f2)
if [ -z "$PORT" ]; then
    PORT=8001
fi

echo "   Testing seed=1..."
TITLE_1=$(curl -s "http://localhost:$PORT/?seed=1" | grep -oP 'class="card-title font-weight-bold">\K[^<]+' | head -1 | xargs)
echo "   First book (seed=1): $TITLE_1"

echo "   Testing seed=42..."
TITLE_42=$(curl -s "http://localhost:$PORT/?seed=42" | grep -oP 'class="card-title font-weight-bold">\K[^<]+' | head -1 | xargs)
echo "   First book (seed=42): $TITLE_42"

if [ "$TITLE_1" = "$TITLE_42" ]; then
    echo "   ⚠️  WARNING: Same book title for both seeds!"
    echo "   This means cards are NOT reordering (dynamic HTML might be disabled)"
else
    echo "   ✅ Different book titles - cards ARE reordering!"
fi
echo ""

# 6. Check for dynamic_layout.js
echo "6. Checking if dynamic_layout.js exists..."
if docker exec $CONTAINER test -f /app/static/js/dynamic_layout.js; then
    echo "   ✅ dynamic_layout.js exists"
    SIZE=$(docker exec $CONTAINER stat -f%z /app/static/js/dynamic_layout.js 2>/dev/null || docker exec $CONTAINER stat -c%s /app/static/js/dynamic_layout.js)
    echo "   File size: $SIZE bytes"
else
    echo "   ❌ dynamic_layout.js NOT found"
fi
echo ""

# Summary
echo "========================================="
echo "  SUMMARY"
echo "========================================="
echo ""
echo "To test dynamic HTML, visit these URLs:"
echo "  http://localhost:$PORT/?seed=1    (default)"
echo "  http://localhost:$PORT/?seed=2    (even seed)"
echo "  http://localhost:$PORT/?seed=42   (different layout)"
echo "  http://localhost:$PORT/?seed=100  (even, larger rotation)"
echo ""
echo "In browser console, run:"
echo "  window.__DYNAMIC_HTML_ENABLED__"
echo "  window.DynamicLayout"
echo ""
echo "If dynamic HTML is disabled, run:"
echo "  cd /home/rev/autoppia_webs_demo"
echo "  ./scripts/setup.sh --demo=books --enable_dynamic_html=true"
echo ""
echo "========================================="

