FROM alpine:latest

# Update apk-tools and ensure all packages are updated
RUN apk add --update nodejs npm update && apk upgrade --no-cache

# RUN apk add --update nodejs npm

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install or update dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
