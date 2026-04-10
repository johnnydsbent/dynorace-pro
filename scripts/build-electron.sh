#!/bin/bash

set -e

WORKSPACE="/home/runner/workspace"
BUILD_DIR="$WORKSPACE/electron-build"

echo "Building DynoRace Pro for macOS..."

echo "Step 1: Building frontend..."
cd "$WORKSPACE"
npx vite build --outDir client/dist 2>&1 | tail -5

echo "Step 2: Compiling Electron TypeScript..."
npx tsc -p electron/tsconfig.json

echo "Step 3: Preparing build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/electron"
mkdir -p "$BUILD_DIR/build"

cp -r client/dist "$BUILD_DIR/dist"
cp electron/*.js "$BUILD_DIR/electron/"
cp build/entitlements.mac.plist "$BUILD_DIR/build/" 2>/dev/null || true
cp build/icon.png "$BUILD_DIR/build/" 2>/dev/null || true
cp electron-builder.json "$BUILD_DIR/"
cp electron-package.json "$BUILD_DIR/package.json"

cd "$BUILD_DIR"

echo "Step 4: Installing dependencies..."
npm install --ignore-scripts 2>&1 | tail -10

echo "Step 5: Building .dmg..."
npx electron-builder --mac --x64 --config electron-builder.json

echo "Build complete!"
ls -la release/ 2>/dev/null || echo "Check release folder for output"

cp -r release "$WORKSPACE/" 2>/dev/null || true
echo "Output files copied to $WORKSPACE/release/"
