#!/bin/bash

# 1. Start Lavalink in the background
echo "Starting Lavalink..."
java -jar Lavalink.jar &

# 2. Wait a moment for Lavalink to be ready
sleep 10

# 3. Start the Discord Bot (This is the process that logs into Discord)
echo "Starting Discord Bot application..."
# 🛑 CHANGE THIS LINE TO YOUR BOT'S STARTUP COMMAND 🛑
node index.js

# 4. Keep the container running until the bot stops
wait -n
exit $?