#!/bin/bash

if [ "$NODE_ENV" = "production" ]; then
  pm2-runtime start processes.config.cjs --env production
else
  tsx src/index.ts
fi