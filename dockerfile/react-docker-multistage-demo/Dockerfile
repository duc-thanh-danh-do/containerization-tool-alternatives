# Stage 1: Build the React app
# This stage uses Node.js because React/Vite needs Node to install packages and build the app.
FROM node:20-alpine AS build

# Set the working directory inside the container.
# All next commands will run inside /app.
WORKDIR /app

# Copy package.json and package-lock.json into /app.
# We copy these first so Docker can cache npm install if dependencies do not change.
COPY package*.json ./

# Install project dependencies inside the container.
# Example: react, react-dom, vite, etc.
RUN npm install

# Copy the rest of the project files into /app.
# This includes src/, index.html, vite.config.js, CSS files, etc.
COPY . .

# Build the React app for production.
# For Vite, this creates a dist/ folder.
RUN npm run build


# Stage 2: Serve the built app with nginx
# This stage uses nginx because the final React app is only static HTML, CSS, and JS files.
FROM nginx:alpine

# Copy the built files from Stage 1.
# /app/dist is the output folder created by npm run build.
# /usr/share/nginx/html is the default folder nginx uses to serve web pages.
COPY --from=build /app/dist /usr/share/nginx/html

# Inform Docker that this container listens on port 80.
# nginx uses port 80 by default.
EXPOSE 80

# Start nginx and keep it running in the foreground.
# "daemon off;" prevents nginx from running in the background,
# so the container stays alive.
CMD ["nginx", "-g", "daemon off;"]