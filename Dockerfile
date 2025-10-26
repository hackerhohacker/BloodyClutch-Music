# 1. Start with a highly stable, non-slim Java 17 image tag (best chance for success)
FROM openjdk:17.0.2-jre

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Download Lavalink and the LavaSrc plugin
RUN curl -LJO "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar" && \
    mkdir -p plugins && \
    curl -LJO --output-dir plugins "https://github.com/topi314/LavaSrc/releases/download/4.8.1/lavasrc-plugin-4.8.1.jar"

# 4. Command to run when the container starts
CMD ["java", "-jar", "Lavalink.jar"]
