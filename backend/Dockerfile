# Use official Node.js base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the backend port
EXPOSE 5001

# Start the app using the "start" script from package.json
CMD ["npm", "run","dev"]
