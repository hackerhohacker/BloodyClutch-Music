#!/bin/bash

# Start Lavalink in the background
java -jar Lavalink.jar &

# INCREASED DELAY: Wait 60 seconds to guarantee Lavalink has fully initialized (it takes ~41 seconds).
sleep 60

# Start the Discord Bot
node src/index.js
