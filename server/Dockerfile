# Use Node.js 22 slim image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose port (as defined in index.js)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
