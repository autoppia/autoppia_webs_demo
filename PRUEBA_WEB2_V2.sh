#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "🧪 SCRIPT DE PRUEBA - WEB_2_DEMO_BOOKS CON V2-SEED"
echo "════════════════════════════════════════════════════════════════"
echo ""

# 1. Verificar que webs_server está corriendo
echo "1️⃣  Verificando webs_server..."
if curl -s http://localhost:8090/health > /dev/null 2>&1; then
    echo "   ✅ webs_server está corriendo"
else
    echo "   ❌ webs_server NO está corriendo"
    echo "   Ejecuta primero: cd webs_server && docker-compose up -d"
    exit 1
fi
echo ""

# 2. Generar 200 libros usando smart generation
echo "2️⃣  Generando 200 libros con IA..."
RESPONSE=$(curl -s -X POST http://localhost:8090/datasets/generate-smart \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_2_demo_books",
    "entity_type": "books",
    "count": 200,
    "mode": "replace"
  }')

if echo "$RESPONSE" | grep -q "Successfully generated"; then
    COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    echo "   ✅ Generados $COUNT libros"
else
    echo "   ⚠️  Error al generar libros, intentando con datos existentes..."
fi
echo ""

# 3. Verificar que los datos se guardaron
echo "3️⃣  Verificando datos guardados..."
LINES=$(wc -l < webs_server/initial_data/web_2_demo_books/data/books_1.json)
echo "   📊 Archivo tiene $LINES líneas"
if [ $LINES -gt 100 ]; then
    echo "   ✅ Datos suficientes para probar"
else
    echo "   ⚠️  Pocos datos, pero funcionará"
fi
echo ""

# 4. Probar endpoint de carga con diferentes seeds
echo "4️⃣  Probando endpoint de carga con seeds..."

echo "   🔹 Probando seed=1..."
SEED1=$(curl -s "http://localhost:8090/datasets/load?project_key=web_2_demo_books&entity_type=books&seed_value=1&limit=5" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "   Seed 1 devolvió: $SEED1 libros"

echo "   🔹 Probando seed=23..."
SEED23=$(curl -s "http://localhost:8090/datasets/load?project_key=web_2_demo_books&entity_type=books&seed_value=23&limit=5" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "   Seed 23 devolvió: $SEED23 libros"

if [ "$SEED1" -gt 0 ] && [ "$SEED23" -gt 0 ]; then
    echo "   ✅ Endpoint de carga funciona correctamente"
else
    echo "   ❌ Endpoint de carga tiene problemas"
    exit 1
fi
echo ""

# 5. Desplegar web_2_demo_books con v2
echo "5️⃣  Desplegando web_2_demo_books con v2-seed..."
echo "   Comando: ./scripts/setup.sh --demo=autobooks --web_port=8002 --enabled_dynamic_versions=v2 --fast=true"
echo ""
echo "   ⏳ Esto tomará ~30 segundos..."
./scripts/setup.sh --demo=autobooks --web_port=8002 --enabled_dynamic_versions=v2 --fast=true

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ DESPLIEGUE COMPLETADO"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🌐 AHORA PRUEBA:"
echo ""
echo "1. Abre: http://localhost:8002/?v2-seed=1"
echo "   → Verás un conjunto de libros"
echo ""
echo "2. Abre: http://localhost:8002/?v2-seed=23"
echo "   → Verás OTROS libros diferentes"
echo ""
echo "3. Navega por la web con seed=23:"
echo "   • Click en 'View Details' de un libro"
echo "   • Verifica que la URL mantiene ?v2-seed=23"
echo "   • Click en 'Home' en el navbar"
echo "   • Verifica que la URL mantiene ?v2-seed=23"
echo ""
echo "4. Cambia manualmente a seed=50:"
echo "   http://localhost:8002/?v2-seed=50"
echo "   → Verás OTROS libros diferentes otra vez"
echo ""
echo "✅ Si los libros cambian y la seed se mantiene → FUNCIONA"
echo ""
echo "════════════════════════════════════════════════════════════════"

