FROM node:21

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY slack/package*.json ./

# Install packages
RUN npm install

RUN npm install -g typescript

RUN npm install -g ts-node

# Modify isDebugMode variable
RUN sed -i 's/let isDebugMode = !module.parent;/let isDebugMode = false;/' node_modules/pdf-parse/index.js

# Copy the app code
COPY slack/ .

# COPY files in shared to the app
COPY shared/ /app/src/llm

# Build the project
RUN tsc

#FILL ENV VARIABLES
ENV OPENAI_API_KEY=""
ENV UPSTASH_REDIS_REST_TOKEN=""
ENV UPSTASH_REDIS_REST_URL=""
ENV UPSTASH_VECTOR_REST_TOKEN=""
ENV UPSTASH_VECTOR_REST_URL=""
ENV SLACK_ACCESS_TOKEN=""
ENV SLACK_SIGNING_SECRET=""
ENV SLACK_APP_TOKEN=""

# Expose ports
EXPOSE 3000

# Run the application
CMD [ "node", "dist/index.js" ]
