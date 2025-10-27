#!/bin/bash

# Define the log file for Lavalink output
LAVALINK_LOG="lavalink.log"

# --- 1. Start Lavalink in the Background ---
echo "Starting Lavalink in background. Output redirected to $LAVALINK_LOG"
java -jar Lavalink.jar > $LAVALINK_LOG 2>&1 &
# Wait for Lavalink to start (optional, but good practice)
sleep 5

# --- 2. Wait for full startup (Discord login, etc.) ---
echo "Sleeping for 120 seconds to allow full Lavalink and Discord login startup..."
sleep 120

# --- 3. Start the Discord Bot (CRITICAL: Must be the last instruction) ---
echo "Starting Discord bot directly and taking over the main process..."
# Execute the bot directly. This ensures the container stays alive as long as Node.js runs.
node src/bot.js
