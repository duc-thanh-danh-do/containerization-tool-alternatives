# Use the official Python 3.12 slim image as the base image.
FROM python:3.12-slim

# ARG is a build-time variable.
# It can be changed when running docker build with --build-arg.
ARG BUILD_VERSION=1.0

# ENV is an environment variable stored in the image/container.
ENV APP_NAME="Dockerfile Level 2"

# Set the working directory inside the image/container.
WORKDIR /app

# Copy the HTML file from the host machine into the image.
COPY index.html .

# Create an information file during the image build process.
# This uses both ENV and ARG values.
RUN echo "App name: $APP_NAME" > app-info.txt && \
    echo "Build version: $BUILD_VERSION" >> app-info.txt && \
    echo "This file was created during docker build." >> app-info.txt

# Document that the container listens on port 8000.
EXPOSE 8000

# Start Python's built-in HTTP server when the container starts.
CMD ["python", "-m", "http.server", "8000"]


