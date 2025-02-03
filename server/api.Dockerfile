# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json, package-lock.json, and tsconfig.json to the container
COPY api/package*.json api/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the entire source code to the container
COPY api/ .

# Expose the port the app runs on
EXPOSE 9000

# Command to run the app (run the compiled JavaScript output)
CMD ["npm", "run", "start"]
