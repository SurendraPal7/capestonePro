# Stage 1: Build the application
FROM node:20-slim AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
# Ensure VITE_API_URL can be passed as an argument if needed, 
# although we'll use Nginx to serve and potentially proxy.
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to nginx static directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if you have one, 
# but for most React apps a basic config is fine.
# We might need a config that redirects all traffic to index.html for SPA routing.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
