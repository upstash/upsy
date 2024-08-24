FROM node:21

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY discord/package*.json ./

# Install packages
RUN npm install

RUN npm install -g typescript

RUN npm install -g ts-node

# Copy the app code
COPY discord/ .

# Build the project
RUN npm run build

#FILL ENV VARIABLES
ENV OPENAI_API_KEY=''
ENV UPSTASH_REDIS_REST_TOKEN=''
ENV UPSTASH_REDIS_REST_URL=''
ENV UPSTASH_VECTOR_REST_URL=""
ENV UPSTASH_VECTOR_REST_TOKEN=""

# Register commands
RUN npm run commands:register

# Expose ports
EXPOSE 3001

# Run the application
CMD [ "node", "dist/start-manager.js" ]
