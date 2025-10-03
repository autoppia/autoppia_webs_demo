#!/bin/bash

# Test script to verify seed mapping formula: ((seed % 30) + 1) % 10 || 10
# This ensures seeds 1-300 map correctly to different layouts

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing Seed Mapping Formula${NC}"
echo "Testing formula: ((seed % 30) + 1) % 10 || 10"
echo "Expected: Seeds should map to different layout variants"
echo

# Function to calculate the mapping
calculate_mapping() {
    local seed=$1
    local mapped=$((((seed % 30) + 1) % 10))
    if [ $mapped -eq 0 ]; then
        mapped=10
    fi
    echo $mapped
}

# Test various seed ranges
echo -e "${BLUE}=== Seed Mapping Test Results ===${NC}"
echo "Seed -> Mapped to Layout"
echo "------------------------"

# Test edge cases and ranges
test_seeds=(1 5 10 15 20 25 30 50 75 100 150 200 250 300)

for seed in "${test_seeds[@]}"; do
    mapped=$(calculate_mapping $seed)
    echo "  $seed -> Layout $mapped"
done

echo -e "\n${BLUE}=== Pattern Analysis ===${NC}"
echo "Testing cycles of 30:"
for i in {0..29}; do
    seed=$((i + 1))
    mapped=$(calculate_mapping $seed)
    printf "%3d->%d " $seed $mapped
    if [ $((i % 10)) -eq 9 ]; then
        echo ""
    fi
done

echo -e "\n${BLUE}=== Comprehensive Test (1-300) ===${NC}"
echo "Testing every seed from 1-300..."

patterns=()
for seed in {1..300}; do
    mapped=$(calculate_mapping $seed)
    patterns[$((mapped-1))]=$((patterns[$((mapped-1))] + 1))
done

echo "Layout usage distribution:"
for i in {1..10}; do
    count=${patterns[$((i-1))]:-0}
    echo "  Layout $i: $count times"
done

echo -e "\n${GREEN}✅ Seed mapping test completed!${NC}"

# Expected results explanation
echo -e "\n${BLUE}Expected Results:${NC}"
echo "- Seeds 1-30: Maps to layouts 1-10 in cycle"
echo "- Seeds 31-60: Repeats the same cycle"
echo "- Seeds 61-90: Repeats the same cycle"
echo "- ...and so on for 300 seeds"
echo "- Each layout should appear approximately 30 times"
