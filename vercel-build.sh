#!/bin/bash

# Run tests before build
echo "Running tests..."
npm run test -- --run

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ Tests passed, proceeding with build"
  exit 0
else
  echo "❌ Tests failed, aborting deployment"
  exit 1
fi
