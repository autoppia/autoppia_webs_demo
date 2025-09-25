#!/bin/bash

echo "🔍 Analyzing Problematic Seed Values"
echo "===================================="
echo ""

# Calculate layout mapping for problematic seeds
echo "📋 Seed to Layout Mapping:"
echo ""

seeds=(160 170 180 200 210 260 270)

for seed in "${seeds[@]}"; do
    # Calculate layout index using the formula: ((Math.ceil(seed / 30) - 1) % 10) + 1
    layout_index=$(( (($seed + 29) / 30 - 1) % 10 + 1 ))
    echo "Seed $seed → Layout $layout_index"
done

echo ""
echo "📋 Layout Analysis:"
echo ""

# Map layout indices to layout descriptions
declare -A layouts
layouts[1]="Classic Amazon-style - navbarStyle: top"
layouts[2]="Modern Minimalist - navbarStyle: top" 
layouts[3]="Search-focused - navbarStyle: top"
layouts[4]="Navigation-heavy - navbarStyle: top"
layouts[5]="Compact - navbarStyle: top"
layouts[6]="Floating Header - navbarStyle: floating"
layouts[7]="Hidden Navigation - navbarStyle: hidden-top"
layouts[8]="Wide Layout - navbarStyle: top"
layouts[9]="Side Navigation - navbarStyle: side"
layouts[10]="Premium - navbarStyle: top"

for seed in "${seeds[@]}"; do
    layout_index=$(( (($seed + 29) / 30 - 1) % 10 + 1 ))
    echo "Seed $seed (Layout $layout_index): ${layouts[$layout_index]}"
done

echo ""
echo "🔍 Potential Issues:"
echo "   • Layout 6 (Floating): May have insufficient padding"
echo "   • Layout 7 (Hidden): May have incorrect padding calculation"
echo "   • Layout 9 (Side): May have height/padding mismatch"
echo "   • Layout 8 (Wide): May have content width issues"
echo ""
