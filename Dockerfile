# 1. Use the highly reliable Eclipse Temurin registry for a slim JRE 17
FROM eclipse-temurin:17-jre-focal

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Install cURL and Node.js/npm (Required to run your Discord Bot, as start.sh uses 'node index.js')
RUN apt-get update && \
    apt-get install -y curl nodejs npm && \
    rm -rf /var/lib/apt/lists/*

# 4. Download Lavalink and the LavaSrc plugin (Existing setup)
RUN curl -LJO "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar" && \
    mkdir -p plugins && \
    curl -Lo plugins/lavasrc-plugin-4.8.1.jar "https://github.com/topi314/LavaSrc/releases/download/4.8.1/lavasrc-plugin-4.8.1.jar"

# --- REQUIRED STEPS TO INCLUDE AND RUN YOUR BOT ---

# 5. Copy all your project files (including your bot's code and package.json)
COPY . .

# 6. Install your bot's dependencies (Node.js/npm dependencies)
RUN npm install

# 7. Copy the startup script (start.sh) and make it executable
COPY start.sh /usr/src/app/
RUN chmod +x /usr/src/app/start.sh

# 8. Command to run when the container starts is now the script.
# This single script handles starting BOTH Lavalink and your bot application.
CMD ["/usr/src/app/start.sh"]
