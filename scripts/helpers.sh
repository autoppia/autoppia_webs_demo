#!/usr/bin/env bash
# helpers.sh - Utility functions for setup.sh

# Convert string to lowercase
to_lower() {
  echo "${1:-}" | tr '[:upper:]' '[:lower:]'
}

# Normalize boolean value (true/1/yes/y -> true, false/0/no/n/"" -> false)
normalize_bool() {
  local v
  v="$(to_lower "${1:-}")"
  case "$v" in
    true|1|yes|y) echo true ;;
    false|0|no|n|"") echo false ;;
    *) echo "__INVALID__" ;;
  esac
}

# Check if port is valid (1-65535)
is_valid_port() {
  local p="$1"
  [[ "$p" =~ ^[0-9]+$ ]] && [ "$p" -ge 1 ] && [ "$p" -le 65535 ]
}

# Check if value is an integer
is_integer() {
  [[ "${1:-}" =~ ^-?[0-9]+$ ]]
}

# Check if demo name is valid
is_valid_demo() {
  case "$1" in
    movies|books|autozone|autodining|autocrm|automail|autodelivery|autolodge|autoconnect|autowork|autocalendar|autolist|autodrive|autohealth|all)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# Normalize and validate dynamic versions (accepts v1,v2 or [v1,v2])
normalize_versions() {
  local raw="$1"
  # Remove brackets and whitespace
  raw="${raw//[[:space:]]/}"
  raw="${raw//\[/}"
  raw="${raw//\]/}"
  
  # Empty -> empty
  if [ -z "$raw" ]; then
    echo ""
    return 0
  fi
  
  # Split and validate each token
  IFS=',' read -ra parts <<<"$raw"
  local out=()
  for p in "${parts[@]}"; do
    # Reject if empty or doesn't match v[0-9]+
    if [[ -z "$p" ]] || [[ ! "$p" =~ ^v[0-9]+$ ]]; then
      echo "__INVALID__"
      return 0
    fi
    out+=("$p")
  done
  
  # Rejoin normalized list
  local IFS=','; echo "${out[*]}"
}

