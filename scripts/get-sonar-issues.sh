#!/usr/bin/env bash
set -euo pipefail

# Fetch and display SonarCloud issues for this project.
# Usage: ./scripts/get-sonar-issues.sh
# Requires SONAR_TOKEN in environment.

PROJECT_KEY="autoppia_autoppia_webs_demo"
HOST_URL="https://sonarcloud.io"
TOKEN="${SONAR_TOKEN:?Set SONAR_TOKEN to your SonarCloud token}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
ORANGE='\033[0;33m'
NC='\033[0m'

rating_to_letter() {
  case "$1" in
    1.0|1) echo "A" ;;
    2.0|2) echo "B" ;;
    3.0|3) echo "C" ;;
    4.0|4) echo "D" ;;
    5.0|5) echo "E" ;;
    A|B|C|D|E) echo "$1" ;;
    *) echo "A" ;;
  esac
}

get_rating_color() {
  local rating=$(rating_to_letter "$1")
  case "${rating}" in
    A) echo -e "${GREEN}A${NC}" ;;
    B) echo -e "${GREEN}B${NC}" ;;
    C) echo -e "${YELLOW}C${NC}" ;;
    D) echo -e "${ORANGE}D${NC}" ;;
    E) echo -e "${RED}E${NC}" ;;
    *) echo "$1" ;;
  esac
}

echo -e "${BLUE}Fetching SonarCloud Quality Gate and metrics...${NC}"
echo ""

USE_JQ=false
command -v jq >/dev/null 2>&1 && USE_JQ=true || echo -e "${YELLOW}Install jq for better parsing: e.g. sudo apt install jq${NC}"
echo ""

QG_RESPONSE=$(curl -s -u "${TOKEN}:" "${HOST_URL}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}" 2>/dev/null || echo "")
METRICS_RESPONSE=$(curl -s -u "${TOKEN}:" "${HOST_URL}/api/measures/component?component=${PROJECT_KEY}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_rating,reliability_rating,sqale_rating,security_review_rating,security_hotspots,accepted_issues" 2>/dev/null || echo "")
ISSUES_RESPONSE=$(curl -s -u "${TOKEN}:" "${HOST_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&resolved=false&ps=100&facets=severities,types" 2>/dev/null || echo "")

if [[ -z "${METRICS_RESPONSE}" ]] || echo "${METRICS_RESPONSE}" | grep -q "error"; then
  echo -e "${RED}Failed to connect to SonarCloud or project not yet analyzed${NC}"
  exit 1
fi

HAS_METRICS=false
if [[ "${USE_JQ}" == "true" ]]; then
  MEASURES_COUNT=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures | length' 2>/dev/null || echo "0")
  [[ "${MEASURES_COUNT}" -gt 0 ]] && HAS_METRICS=true
else
  echo "${METRICS_RESPONSE}" | grep -q '"measures":\[.*\]' && ! echo "${METRICS_RESPONSE}" | grep -q '"measures":\[\]' && HAS_METRICS=true
fi

if [[ "${USE_JQ}" == "true" ]]; then
  if [[ "${HAS_METRICS}" == "true" ]]; then
    BUGS=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="bugs") | .value // "0"' 2>/dev/null || echo "0")
    VULNERABILITIES=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="vulnerabilities") | .value // "0"' 2>/dev/null || echo "0")
    CODE_SMELLS=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="code_smells") | .value // "0"' 2>/dev/null || echo "0")
    COVERAGE=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="coverage") | .value // "0"' 2>/dev/null || echo "0")
    DUPLICATED=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="duplicated_lines_density") | .value // "0"' 2>/dev/null || echo "0")
    SECURITY_RATING_RAW=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="security_rating") | .value // "1.0"' 2>/dev/null || echo "1.0")
    RELIABILITY_RATING_RAW=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="reliability_rating") | .value // "1.0"' 2>/dev/null || echo "1.0")
    MAINTAINABILITY_RATING_RAW=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="sqale_rating") | .value // "1.0"' 2>/dev/null || echo "1.0")
    SECURITY_REVIEW_RATING_RAW=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="security_review_rating") | .value // "1.0"' 2>/dev/null || echo "1.0")
    SECURITY_HOTSPOTS=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="security_hotspots") | .value // "0"' 2>/dev/null || echo "0")
    ACCEPTED_ISSUES=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="accepted_issues") | .value // "0"' 2>/dev/null || echo "0")
    SECURITY_RATING=$(rating_to_letter "${SECURITY_RATING_RAW}")
    RELIABILITY_RATING=$(rating_to_letter "${RELIABILITY_RATING_RAW}")
    MAINTAINABILITY_RATING=$(rating_to_letter "${MAINTAINABILITY_RATING_RAW}")
    SECURITY_REVIEW_RATING=$(rating_to_letter "${SECURITY_REVIEW_RATING_RAW}")
  else
    BUGS=VULNERABILITIES=CODE_SMELLS=COVERAGE=DUPLICATED=SECURITY_HOTSPOTS=ACCEPTED_ISSUES="0"
    SECURITY_RATING=RELIABILITY_RATING=MAINTAINABILITY_RATING=SECURITY_REVIEW_RATING="A"
  fi
  QG_STATUS=$(echo "${QG_RESPONSE}" | jq -r '.projectStatus.status // "UNKNOWN"' 2>/dev/null || echo "UNKNOWN")
  BLOCKER_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="BLOCKER")] | length' 2>/dev/null || echo "0")
  CRITICAL_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="CRITICAL")] | length' 2>/dev/null || echo "0")
  MAJOR_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="MAJOR")] | length' 2>/dev/null || echo "0")
  MINOR_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="MINOR")] | length' 2>/dev/null || echo "0")
  INFO_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="INFO")] | length' 2>/dev/null || echo "0")
else
  BUGS=VULNERABILITIES=CODE_SMELLS=COVERAGE=DUPLICATED=SECURITY_HOTSPOTS=ACCEPTED_ISSUES="0"
  SECURITY_RATING=RELIABILITY_RATING=MAINTAINABILITY_RATING=SECURITY_REVIEW_RATING="A"
  QG_STATUS="UNKNOWN"
  BLOCKER_COUNT=CRITICAL_COUNT=MAJOR_COUNT=MINOR_COUNT=INFO_COUNT="0"
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
if [[ "${QG_STATUS}" == "OK" ]]; then
  echo -e "${GREEN}  Quality Gate: PASSED${NC}"
elif [[ "${QG_STATUS}" == "UNKNOWN" ]] || [[ "${HAS_METRICS}" == "false" ]]; then
  echo -e "${YELLOW}  Quality Gate: NOT AVAILABLE (run analysis first)${NC}"
else
  echo -e "${RED}  Quality Gate: FAILED${NC}"
fi
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

if [[ "${HAS_METRICS}" == "false" ]]; then
  echo -e "${YELLOW}No metrics yet. Run 'npm run sonar' to run the first analysis.${NC}"
  echo ""
else
  echo -e "${BLUE}Metrics:${NC}"
  echo -e "  Security: ${BUGS} Bugs, Rating: $(get_rating_color ${SECURITY_RATING})"
  echo -e "  Reliability: ${VULNERABILITIES} Vulnerabilities, Rating: $(get_rating_color ${RELIABILITY_RATING})"
  echo -e "  Maintainability: ${CODE_SMELLS} Code Smells, Rating: $(get_rating_color ${MAINTAINABILITY_RATING})"
  echo -e "  Coverage: ${COVERAGE}%"
  echo -e "  Duplications: ${DUPLICATED}%"
  echo -e "  Security Hotspots: ${SECURITY_HOTSPOTS}, Rating: $(get_rating_color ${SECURITY_REVIEW_RATING})"
  echo ""
fi

echo -e "${RED}Issues by severity:${NC}"
echo -e "  Blocker: ${BLOCKER_COUNT}  Critical: ${CRITICAL_COUNT}  Major: ${MAJOR_COUNT}  Minor: ${MINOR_COUNT}  Info: ${INFO_COUNT}"
echo ""

if [[ "${USE_JQ}" == "true" ]] && [[ -n "${ISSUES_RESPONSE}" ]]; then
  TOTAL_ISSUES=$(echo "${ISSUES_RESPONSE}" | jq -r '.total // 0' 2>/dev/null || echo "0")
  if [[ ${TOTAL_ISSUES} -gt 0 ]]; then
    echo "${ISSUES_RESPONSE}" | jq -r '.issues[0:20] | group_by(.component) | .[] | "  " + .[0].component + "\n" + (.[] | "    L\(.line // "?") [\(.severity)] \(.message)\n")' 2>/dev/null || true
    [[ ${TOTAL_ISSUES} -gt 20 ]] && echo -e "${YELLOW}  ... and $((TOTAL_ISSUES - 20)) more. See SonarCloud for full list.${NC}"
    echo ""
  fi
fi

echo -e "${BLUE}Links:${NC}"
echo -e "  Dashboard: ${HOST_URL}/dashboard?id=${PROJECT_KEY}"
echo -e "  Issues: ${HOST_URL}/project/issues?id=${PROJECT_KEY}&resolved=false"
echo ""
