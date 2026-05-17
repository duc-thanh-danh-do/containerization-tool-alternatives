# Use the official Python 3.12 image as the base image.
# "slim" means it is a smaller and lighter version of the Python image.
FROM python:3.12-slim

# Set /app as the working directory inside the image/container.
# If /app does not exist, Docker will create it automatically.
WORKDIR /app

# Copy the index.html file from the project folder on the host machine
# into the current working directory inside the image.
# Here, "." means /app because WORKDIR is already set to /app.
COPY index.html .

# Document that the container is expected to listen on port 8000.
# This does not publish the port automatically.
# The port is actually mapped when running: docker run -p 8000:8000 ...
EXPOSE 8000

# Define the default command that runs when the container starts.
# This starts Python's built-in HTTP server on port 8000.
# Because the working directory is /app, it will serve index.html from /app.
CMD ["python", "-m", "http.server", "8000"]