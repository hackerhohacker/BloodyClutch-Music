#!/bin/bash

# Start Lavalink in the background
java -jar Lavalink.jar > lavalink.log 2>&1 &

# Wait 2 minutes for Lavalink to fully start and for the Discord client to connect.
# This prevents Render from killing the process before the bot is fully initialized.
echo "Lavalink started in background. Sleeping for 120 seconds to allow full startup..."
sleep 120

# Start the Discord bot in the foreground
echo "Starting Discord bot..."
npm start
