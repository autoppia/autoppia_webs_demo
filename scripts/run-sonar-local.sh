#!/bin/bash

# Run SonarCloud analysis and upload results.
# Usage: ./scripts/run-sonar-local.sh
#
# Requires SONAR_TOKEN in environment (no default token in script).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}SonarCloud Analysis${NC}"
echo ""

echo -e "${YELLOW}Warning: This script will UPDATE SonarCloud with your local results.${NC}"
echo -e "To only view issues without uploading: npm run sonar:issues"
echo ""
read -p "Continue and update SonarCloud? (s/N): " -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${GREEN}Cancelled. Use 'npm run sonar:issues' to view issues without uploading.${NC}"
  exit 0
fi

if [ -z "${SONAR_TOKEN:-}" ]; then
  echo -e "${RED}Error: SONAR_TOKEN is not set${NC}"
  echo "Set it with: export SONAR_TOKEN=your-token"
  exit 1
fi

echo -e "${GREEN}Token configured${NC}"
echo ""

# SonarScanner install
SONAR_SCANNER_HOME="${SONAR_SCANNER_HOME:-$HOME/.sonar-scanner}"
SONAR_SCANNER_VERSION="7.0.2.4839"
SONAR_SCANNER_DIR="$SONAR_SCANNER_HOME/sonar-scanner-$SONAR_SCANNER_VERSION-linux-x64"

if [ ! -d "$SONAR_SCANNER_DIR" ]; then
  echo -e "${YELLOW}Installing SonarScanner...${NC}"
  mkdir -p "$SONAR_SCANNER_HOME"
  cd "$SONAR_SCANNER_HOME"
  SCANNER_FILE="sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip"
  SCANNER_URL="https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/${SCANNER_FILE}"
  wget -q "$SCANNER_URL" || { echo -e "${RED}Failed to download SonarScanner${NC}"; exit 1; }
  unzip -q -o "$SCANNER_FILE" || { echo -e "${RED}Failed to extract SonarScanner${NC}"; exit 1; }
  EXTRACTED_DIR="sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64"
  if [ -d "$EXTRACTED_DIR" ] && [ "$EXTRACTED_DIR" != "$SONAR_SCANNER_DIR" ]; then
    mv "$EXTRACTED_DIR" "$SONAR_SCANNER_DIR" 2>/dev/null || true
  fi
  rm -f "$SCANNER_FILE"
  echo -e "${GREEN}SonarScanner installed at: $SONAR_SCANNER_DIR${NC}"
  echo ""
fi

cd "$PROJECT_ROOT"
export PATH="$SONAR_SCANNER_DIR/bin:$PATH"
SONAR_SCANNER_CMD="$SONAR_SCANNER_DIR/bin/sonar-scanner"

if [ ! -f "$SONAR_SCANNER_CMD" ]; then
  echo -e "${RED}Error: sonar-scanner not found at $SONAR_SCANNER_CMD${NC}"
  exit 1
fi

echo -e "${GREEN}SonarScanner found${NC}"
echo ""

if [ ! -f "sonar-project.properties" ]; then
  echo -e "${RED}Error: sonar-project.properties not found${NC}"
  exit 1
fi

# Optional: build one app (for type resolution)
if [ -d "web_1_autocinema" ] && [ -f "web_1_autocinema/package.json" ]; then
  echo -e "${YELLOW}Building reference app...${NC}"
  (cd web_1_autocinema && npm run build) || echo -e "${YELLOW}Build failed, continuing with analysis...${NC}"
  echo ""
fi

echo -e "${GREEN}Running analysis and uploading to SonarCloud...${NC}"
echo ""
export SONAR_TOKEN

$SONAR_SCANNER_CMD \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.token="$SONAR_TOKEN" \
  -Dsonar.issuesReport.html.enable=true \
  -Dsonar.issuesReport.console.enable=true

EXIT_CODE=$?
echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}Analysis completed and uploaded${NC}"
  echo -e "${BLUE}Dashboard: https://sonarcloud.io/dashboard?id=autoppia_autoppia_webs_demo${NC}"
  echo ""
  if [ -f "$SCRIPT_DIR/get-sonar-issues.sh" ]; then
    sleep 3
    "$SCRIPT_DIR/get-sonar-issues.sh"
  fi
else
  echo -e "${RED}Analysis failed with exit code: $EXIT_CODE${NC}"
  exit $EXIT_CODE
fi
