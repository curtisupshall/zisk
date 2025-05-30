# syntax=docker/dockerfile:experimental

# Build stage for the Vite app
FROM node:20-alpine AS app-builder
WORKDIR /app

# Copy app package files
COPY app/package*.json ./
RUN npm ci

# Copy app source files
COPY app/ ./

# Build the Vite app
RUN npm run build

# Build stage for the Express server
FROM node:20-alpine AS server-builder
WORKDIR /server

# Copy server package files
COPY server/package*.json ./
RUN npm ci

# Copy server source files
COPY server/ ./

# Build the server
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy built server files
COPY --from=server-builder /server/dist ./dist
COPY --from=server-builder /server/package*.json ./

# Copy built Vite app to the server's expected location
COPY --from=app-builder /app/dist ./app/dist

# Install production dependencies only
RUN npm ci --omit=dev

# Expose the port the server runs on
EXPOSE 9475

# Start the server
CMD ["npm", "start"]
