#!/bin/bash
# Run tests for all packages that have test files
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAILED=()

for pkg_dir in "$REPO_ROOT/packages/"*/; do
  pkg_name=$(basename "$pkg_dir")
  if ls "$pkg_dir/test/"*.test.ts 2>/dev/null | head -1 > /dev/null; then
    echo "=== Testing $pkg_name ==="
    if (cd "$pkg_dir" && "$REPO_ROOT/node_modules/jest-cli/bin/jest.js" --no-coverage 2>&1); then
      echo "PASS: $pkg_name"
    else
      echo "FAIL: $pkg_name"
      FAILED+=("$pkg_name")
    fi
  fi
done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo "\nFailed packages: ${FAILED[*]}"
  exit 1
else
  echo "\nAll tests passed!"
fi
