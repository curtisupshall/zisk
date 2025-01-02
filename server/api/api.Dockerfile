FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY api/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the rest of the application
COPY api/ .

# Expose the port
EXPOSE 9000

# Start the application
CMD ["node", "src/server.js"]
