FROM mhart/alpine-node

# Update apk-tools and ensure all packages are updated
RUN apk update && apk upgrade --no-cache

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install or update dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
