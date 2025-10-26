# 1. Start with a dedicated Java image (this grants root permissions initially)
FROM openjdk:17-jre-slim

# 2. Set the working directory
WORKDIR /usr/src/app

# 3. Download the Lavalink JAR and LavaSrc Plugin
# Note: Because this is done in the Dockerfile build process,
# the image has full permission, and we no longer need apt-get.
RUN curl -LJO "https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar" && \
    mkdir -p plugins && \
    curl -LJO --output-dir plugins "https://github.com/topi314/LavaSrc/releases/download/4.8.1/lavasrc-plugin-4.8.1.jar"

# 4. The command to run when the container starts
CMD ["java", "-jar", "Lavalink.jar"]
