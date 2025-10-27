#!/bin/bash

# 1. Start Lavalink in the background
echo "Starting Lavalink..."
java -jar Lavalink.jar &

# 2. Wait a moment for Lavalink to be ready
# CRITICAL FIX: Increased sleep time to 45 seconds to wait for Lavalink's 40-second startup.
sleep 45

# 3. Start the Discord Bot application
echo "Starting Discord Bot application..."
node src/index.js

# 4. Keep the container running until the bot stops
wait -n
exit $?
