#!/bin/bash

# This script runs TypeScript scripts with the correct configuration
# Usage: ./run-script.sh script-name.ts
# Example: ./run-script.sh create-admin-user.ts

if [ -z "$1" ]; then
  echo "Error: Please provide a script name"
  echo "Usage: ./run-script.sh script-name.ts"
  exit 1
fi

SCRIPT_NAME=$1
SCRIPT_PATH="$(dirname "$0")/$SCRIPT_NAME"

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Error: Script $SCRIPT_PATH not found"
  exit 1
fi

echo "Running script: $SCRIPT_PATH"

# Run the script with ts-node using the scripts tsconfig
npx ts-node --project src/scripts/tsconfig.json "$SCRIPT_PATH"