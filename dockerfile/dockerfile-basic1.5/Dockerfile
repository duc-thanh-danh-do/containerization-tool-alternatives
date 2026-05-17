# Use the official Python 3.12 slim image as the base image.
FROM python:3.12-slim

# Set an environment variable inside the image/container.
ENV APP_NAME="Dockerfile greeting app"

# Set the working directory inside the container.
WORKDIR /app

# Copy the HTML file from the host machine into the image.
COPY index.html .

# Run a command during the image build process.
# This creates a small text file inside the image.
RUN echo "This file was created during docker build." > build-info.txt

# Document that the container listens on port 8000.
EXPOSE 8000

# Start Python's built-in HTTP server when the container starts.
CMD ["python", "-m", "http.server", "8000"]