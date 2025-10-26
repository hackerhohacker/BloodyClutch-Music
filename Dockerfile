# 1. Use the highly reliable Eclipse Temurin registry for a slim JRE 17
FROM eclipse-temurin:17-jre-focal

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Install cURL (since this base image might not have it)
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# 4. Download Lavalink and the LavaSrc plugin
# FIX: Replaced '--output-dir plugins' with '-Lo plugins/filename.jar' for compatibility
RUN curl -LJO "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar" && \
    mkdir -p plugins && \
    curl -Lo plugins/lavasrc-plugin-4.8.1.jar "https://github.com/topi314/LavaSrc/releases/download/4.8.1/lavasrc-plugin-4.8.1.jar"

# 5. Command to run when the container starts
CMD ["java", "-jar", "Lavalink.jar"]
