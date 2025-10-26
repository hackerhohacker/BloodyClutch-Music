# Use a Java 17 Runtime Environment
FROM openjdk:17-jre-slim

# Set working directory
WORKDIR /usr/src/app

# Download Lavalink and plugins (using the full path in the container)
RUN curl -LJO "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar" && \
    mkdir -p plugins && \
    curl -LJO --output-dir plugins "https://github.com/topi314/LavaSrc/releases/download/4.8.1/lavasrc-plugin-4.8.1.jar"

# Command to run the Lavalink server
CMD ["java", "-jar", "Lavalink.jar"]
