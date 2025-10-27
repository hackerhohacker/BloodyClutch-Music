# 1. Use the highly reliable Eclipse Temurin registry for a slim JRE 17
FROM eclipse-temurin:17-jre-focal

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Install cURL, dos2unix (for line endings fix), and the packages needed for Node.js setup
RUN apt-get update && \
    apt-get install -y curl gnupg dos2unix && \
    rm -rf /var/lib/apt/lists/*

# 4. Install Node.js v20 (modern version to support your Discord bot libraries)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# 5. Download Lavalink and the LavaSrc plugin (Existing setup)
RUN curl -LJO "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar" && \
    mkdir -p plugins && \
    curl -Lo plugins/lavasrc-plugin-4.8.1.jar "https://github.com/topi314/LavaSrc/releases/download/4.8.1/lavasrc-plugin-4.8.1.jar"

# --- REQUIRED STEPS TO INCLUDE AND RUN YOUR BOT ---

# 6. Copy all your project files (including your bot's code, start.sh, and package.json)
COPY . .

# CRITICAL CACHE BUSTER: Force the build layer to recognize the new src/bot.js file
RUN cat src/bot.js > /dev/null

# 7. FIX: Convert start.sh to use Linux line endings (LF)
RUN dos2unix start.sh

# 8. Install your bot's dependencies (Node.js dependencies)
RUN npm install

# 9. Make sure the script is executable
RUN chmod +x /usr/src/app/start.sh

# 10. Command to run when the container starts is now the script.
CMD ["/usr/src/app/start.sh"]
