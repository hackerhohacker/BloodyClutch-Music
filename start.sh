#!/bin/bash

# Start Lavalink in the background
java -jar Lavalink.jar > lavalink.log 2>&1 &

# Wait 2 minutes for Lavalink to fully start and for the Discord client to connect.
# Render kills the container if the entrypoint finishes too quickly without an open port.
echo "Lavalink started in background. Sleeping for 120 seconds to allow full startup..."
sleep 120

# Start the Discord bot in the foreground
echo "Starting Discord bot..."
npm start

# Keep the container alive after the bot exits (optional, but good practice)
tail -f /dev/null
