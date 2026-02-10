#!/bin/bash
set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WEBSITE_DIR="$ROOT_DIR/website"

# Read version from root package.json
VERSION=$(node -p "require('$ROOT_DIR/package.json').version")

echo "Deploying website for Tusk v$VERSION..."

# Update LATEST_VERSION in page.tsx
PAGE_FILE="$WEBSITE_DIR/app/page.tsx"
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/const LATEST_VERSION = \"[^\"]*\"/const LATEST_VERSION = \"$VERSION\"/" "$PAGE_FILE"
else
  # Linux
  sed -i "s/const LATEST_VERSION = \"[^\"]*\"/const LATEST_VERSION = \"$VERSION\"/" "$PAGE_FILE"
fi

echo "Updated LATEST_VERSION to $VERSION"

# Build and deploy
cd "$WEBSITE_DIR"

echo "Building for Cloudflare Pages..."
npx @cloudflare/next-on-pages

echo "Deploying to Cloudflare..."
npx wrangler pages deploy .vercel/output/static --project-name tusk --commit-dirty=true

echo "Website deployed successfully!"
