# /web/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=9475

# Expose the port
EXPOSE 9475

# Start the development server
CMD ["npm", "run", "dev"]
