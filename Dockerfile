# 1. Start with a stable Debian image (reliable base)
FROM debian:bookworm-slim

# 2. Install Java 17 (This is allowed now because it's a Docker build step)
RUN apt-get update && \
    apt-get install -y openjdk-17-jre-headless && \
    rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the container
WORKDIR /usr/src/app

# 4. Download Lavalink and the LavaSrc plugin
RUN curl -LJO "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar" && \
    mkdir -p plugins && \
    curl -LJO --output-dir plugins "https://github.com/topi314/LavaSrc/releases/download/4.8.1/lavasrc-plugin-4.8.1.jar"

# 5. Command to run when the container starts
CMD ["java", "-jar", "Lavalink.jar"]
