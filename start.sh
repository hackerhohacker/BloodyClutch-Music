#!/bin/bash

# Define the log file for Lavalink output
LAVALINK_LOG="lavalink.log"

# --- 1. Start Lavalink in the Background ---
echo "Starting Lavalink in background. Output redirected to $LAVALINK_LOG"
# Use a simple background command to ensure the script proceeds
java -jar Lavalink.jar > $LAVALINK_LOG 2>&1 &

# --- 2. Wait for Lavalink and Discord Login to Stabilize ---
echo "Sleeping for 120 seconds to allow full Lavalink and Discord login startup..."
sleep 120

# --- 3. Start the Discord Bot in the Foreground ---
echo "Starting Discord bot via npm start..."
# This command must be the final command, keeping the container alive
npm start
