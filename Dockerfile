# Use an Ubuntu base image with Java installed (Open-JDK 17)
FROM openjdk:17-jre-slim

# Set the working directory
WORKDIR /usr/src/app

# Download the main Lavalink server JAR
RUN curl -LJO "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar"

# Create the plugins directory and download the Lavasrc plugin
RUN mkdir -p plugins && \
    curl -LJO --output-dir plugins "https://github.com/topi314/LavaSrc/releases/download/4.8.1/lavasrc-plugin-4.8.1.jar"

# The command to run the Lavalink server when the container starts
CMD ["java", "-jar", "Lavalink.jar"]