#!/bin/bash

# Define the log file for Lavalink output
LAVALINK_LOG="lavalink.log"

# --- 1. Start Lavalink in the Background ---
echo "Starting Lavalink in background. Output redirected to $LAVALINK_LOG"
java -jar Lavalink.jar > $LAVALINK_LOG 2>&1 &

# --- 2. Wait for Lavalink and Discord Login to Stabilize ---
echo "Sleeping for 120 seconds to allow full Lavalink and Discord login startup..."
sleep 120

# --- 3. Start the Discord Bot and take over the shell process ---
echo "Starting Discord bot via exec npm start..."
# CRITICAL FIX: 'exec' ensures the shell process is replaced by the npm start process,
# which keeps the container alive until the bot is stopped.
exec npm start
