#!/bin/bash
set -e
# Runs on Replit after a git merge (see .replit [postMerge]).
# Keeps installed dependencies in sync with the lockfile.
pnpm install --frozen-lockfile
