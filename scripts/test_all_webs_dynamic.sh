#!/bin/bash

# Script para probar el sistema dinámico en todas las webs
# Ejecuta test-dynamic-system.js en cada web y genera un resumen

# No usar set -e para que continúe aunque una web falle

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE_DIR"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🧪 TEST DEL SISTEMA DINÁMICO - TODAS LAS WEBS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Arrays para almacenar resultados
declare -a PASSED_WEBS=()
declare -a FAILED_WEBS=()
declare -a MISSING_WEBS=()
declare -a ERROR_WEBS=()

# Función para probar una web
test_web() {
    local web_dir="$1"
    local web_name=$(basename "$web_dir")

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Probando: ${web_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Verificar si existe el directorio
    if [ ! -d "$web_dir" ]; then
        echo -e "${YELLOW}⚠️  Directorio no encontrado: ${web_dir}${NC}"
        MISSING_WEBS+=("$web_name (directorio no existe)")
        return 1
    fi

    # Verificar si existe el test
    local test_file="${web_dir}/tests/test-dynamic-system.js"
    if [ ! -f "$test_file" ]; then
        echo -e "${YELLOW}⚠️  Test no encontrado: ${test_file}${NC}"
        MISSING_WEBS+=("$web_name (test no existe)")
        return 1
    fi

    # Cambiar al directorio de la web
    cd "$web_dir"

    # Verificar si tiene node_modules (necesario para ejecutar el test)
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  node_modules no encontrado. Intentando instalar dependencias...${NC}"
        if command -v npm &> /dev/null; then
            npm install --silent 2>&1 | head -5
        elif command -v pnpm &> /dev/null; then
            pnpm install --silent 2>&1 | head -5
        else
            echo -e "${RED}❌ No se encontró npm ni pnpm. No se puede ejecutar el test.${NC}"
            ERROR_WEBS+=("$web_name (sin npm/pnpm)")
            cd "$BASE_DIR"
            return 1
        fi
    fi

    # Ejecutar el test
    echo ""
    if node tests/test-dynamic-system.js 2>&1; then
        echo ""
        echo -e "${GREEN}✅ ${web_name}: TEST PASADO${NC}"
        PASSED_WEBS+=("$web_name")
        cd "$BASE_DIR"
        return 0
    else
        local exit_code=$?
        echo ""
        echo -e "${RED}❌ ${web_name}: TEST FALLIDO (exit code: ${exit_code})${NC}"
        FAILED_WEBS+=("$web_name")
        cd "$BASE_DIR"
        return 1
    fi
}

# Probar todas las webs
# Buscar todos los directorios web_* y ordenarlos numéricamente
for web_dir in ${BASE_DIR}/web_*; do
    if [ ! -d "$web_dir" ]; then
        continue
    fi

    web_name=$(basename "$web_dir")

    # Verificar que es un directorio de web (empieza con web_ y tiene un número)
    if [[ ! "$web_name" =~ ^web_[0-9]+_ ]]; then
        continue
    fi

    test_web "$web_dir" || true  # || true para que continúe aunque falle
    echo ""
done

# Resumen final
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 RESUMEN FINAL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

total_webs=$((${#PASSED_WEBS[@]} + ${#FAILED_WEBS[@]} + ${#MISSING_WEBS[@]} + ${#ERROR_WEBS[@]}))

echo -e "${GREEN}✅ Webs con test pasado: ${#PASSED_WEBS[@]}${NC}"
if [ ${#PASSED_WEBS[@]} -gt 0 ]; then
    for web in "${PASSED_WEBS[@]}"; do
        echo -e "   ${GREEN}✓${NC} $web"
    done
fi

echo ""
echo -e "${RED}❌ Webs con test fallido: ${#FAILED_WEBS[@]}${NC}"
if [ ${#FAILED_WEBS[@]} -gt 0 ]; then
    for web in "${FAILED_WEBS[@]}"; do
        echo -e "   ${RED}✗${NC} $web"
    done
fi

echo ""
echo -e "${YELLOW}⚠️  Webs sin test o con problemas: $((${#MISSING_WEBS[@]} + ${#ERROR_WEBS[@]}))${NC}"
if [ ${#MISSING_WEBS[@]} -gt 0 ]; then
    for web in "${MISSING_WEBS[@]}"; do
        echo -e "   ${YELLOW}⚠${NC}  $web"
    done
fi
if [ ${#ERROR_WEBS[@]} -gt 0 ]; then
    for web in "${ERROR_WEBS[@]}"; do
        echo -e "   ${YELLOW}⚠${NC}  $web"
    done
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ ${#FAILED_WEBS[@]} -eq 0 ] && [ ${#MISSING_WEBS[@]} -eq 0 ] && [ ${#ERROR_WEBS[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODAS LAS WEBS PASARON EL TEST!${NC}"
    exit 0
elif [ ${#PASSED_WEBS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Algunas webs pasaron, pero hay problemas en otras.${NC}"
    exit 1
else
    echo -e "${RED}❌ Ninguna web pasó el test o todas tienen problemas.${NC}"
    exit 1
fi
