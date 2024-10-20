#!/bin/bash

DEPLOY_CHANGE_FILE="DEPLOY_CHANGE_FILE"

# Check if the file exists
if [ ! -f "$DEPLOY_CHANGE_FILE" ]; then
  echo "File not found!"
  exit 1
fi

# Toggle true/false in the file
sed -i "s/true/temp_value/g; s/false/true/g; s/temp_value/false/g" "$DEPLOY_CHANGE_FILE"

# Commit the changes to the main branch
git add "$DEPLOY_CHANGE_FILE"
git commit -m "Deploy to Vercel"
git push origin main
