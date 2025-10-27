#!/bin/bash

# 1. Start Lavalink in the background
echo "Starting Lavalink..."
java -jar Lavalink.jar &

# 2. Wait a moment for Lavalink to be ready
# INCREASED SLEEP TIME: Set to 30 seconds to give Lavalink enough time to fully initialize.
sleep 30

# 3. Start the Discord Bot (Use the CORRECT file name here)
echo "Starting Discord Bot application..."
# 🛑 CHANGE THIS LINE TO YOUR BOT'S CORRECT STARTUP FILE 🛑
node src/index.js # Corrected path from package.json: "start": "node src/index.js"

# 4. Keep the container running until the bot stops
wait -n
exit $?
