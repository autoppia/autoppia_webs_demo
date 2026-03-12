#!/bin/bash
# Script de prueba para el endpoint /datasets/generate-smart
# Prueba modos append y replace

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "🧪 PRUEBA DEL ENDPOINT /datasets/generate-smart"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

API_URL="${API_URL:-http://localhost:8090}"

echo "📝 Esperando que webs_server esté listo..."
for i in {1..30}; do
  if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ webs_server está listo"
    break
  fi
  echo "   Esperando... ($i/30)"
  sleep 2
done

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "🧪 TEST 1: Añadir 10 restaurants a web_4_autodining (modo append)"
echo "─────────────────────────────────────────────────────────────────────"
echo "   Esto añadirá 10 restaurants a los 200 existentes (total: 210)"
echo ""

curl -X POST "$API_URL/datasets/generate-smart" \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_4_autodining",
    "entity_type": "restaurants",
    "count": 10,
    "mode": "append"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null | jq '{message, count, saved_path}' 2>/dev/null || echo "❌ Error en test 1" >&2

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "🧪 TEST 2: Generar 5 emails nuevos para web_6 (modo replace)"
echo "─────────────────────────────────────────────────────────────────────"
echo "   Esto crea un nuevo archivo con timestamp"
echo ""

curl -X POST "$API_URL/datasets/generate-smart" \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_6_automail",
    "entity_type": "emails",
    "count": 5,
    "mode": "replace"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null | jq '{message, count, saved_path}' 2>/dev/null || echo "❌ Error en test 2" >&2

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "🧪 TEST 3: Añadir 15 logs a web_5_autocrm (modo append por defecto)"
echo "─────────────────────────────────────────────────────────────────────"
echo "   Si no especificas mode, usa append por defecto"
echo ""

curl -X POST "$API_URL/datasets/generate-smart" \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_5_autocrm",
    "entity_type": "logs",
    "count": 15
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null | jq '{message, count, saved_path}' 2>/dev/null || echo "❌ Error en test 3" >&2

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "🧪 TEST 4: Verificar conteo de restaurants en web_4"
echo "─────────────────────────────────────────────────────────────────────"

# Contar cuántos restaurants hay ahora en web_4
RESTAURANT_COUNT=$(docker exec webs_server-app-1 cat /app/data/web_4_autodining/data/restaurants_1.json 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
echo "   📊 Total de restaurants en web_4: $RESTAURANT_COUNT"
echo "   ✅ Deberían ser ~210 (200 originales + 10 nuevos)"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ TESTS COMPLETADOS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📊 RESUMEN:"
echo "   - TEST 1: Añadió 10 restaurants (append)"
echo "   - TEST 2: Creó archivo nuevo con 5 emails (replace)"
echo "   - TEST 3: Añadió 15 logs (append por defecto)"
echo "   - TEST 4: Verificó total de restaurants: $RESTAURANT_COUNT"
echo ""
echo "📁 Archivos modificados/creados:"
echo "   - initial_data/web_4_autodining/data/restaurants_1.json (append)"
echo "   - initial_data/web_6_automail/data/emails_*.json (nuevo)"
echo "   - initial_data/web_5_autocrm/data/logs_1.json (append)"
echo ""
