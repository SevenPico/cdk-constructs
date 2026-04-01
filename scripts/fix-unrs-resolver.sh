#!/bin/bash
# Stubs the ARM64 native binding for unrs-resolver so the WASM fallback is used.
# This is needed in QEMU-emulated ARM64 environments where the native binary
# uses CPU instructions that are not available (SIGILL).
set -e
BINDING="node_modules/@unrs/resolver-binding-linux-arm64-gnu/resolver.linux-arm64-gnu.node"
if [ -f "$BINDING" ]; then
  printf 'stub' > "$BINDING"
  echo "[fix-unrs-resolver] Stubbed $BINDING — WASM fallback will be used"
fi
