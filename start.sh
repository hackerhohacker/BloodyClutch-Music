#!/bin/bash

# Start Lavalink in the background
java -jar Lavalink.jar &

echo "Starting Lavalink in background. Output redirected to lavalink.log"

# Wait for Lavalink to fully start up and register with Discord
sleep 120

echo "Sleeping for 120 seconds to allow full Lavalink and Discord login startup..."

# Start the Node.js bot and keep it in the foreground
echo "Starting Discord bot directly and taking over the main process..."
npm start
