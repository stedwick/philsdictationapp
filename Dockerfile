# Use Node.js LTS version as the base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean cache
RUN npm install

# Copy source code
COPY . .

# Expose port 5173 (Vite's default port)
EXPOSE 5173

ENV NODE_ENV=development

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"] 