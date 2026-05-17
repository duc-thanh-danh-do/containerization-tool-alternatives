# Use a small official Python image as the base image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the dependency list first
# This helps Docker cache the pip install step
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code into the container
COPY . .

# Tell Docker that the app uses port 8000
EXPOSE 8000

# Start the FastAPI app with uvicorn
# 0.0.0.0 is important so the app can be accessed from outside the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]