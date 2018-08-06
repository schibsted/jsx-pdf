# You should always specify a full version here to ensure all of your developers
# are running the same version of Node.
FROM node:8.11.2-alpine

WORKDIR /app/

# Copy local files into the image.
COPY --chown=node:node . /app/

# Install dependencies
RUN yarn install && yarn cache clean

# Set the command to start the node server.
CMD node --require babel-register example/index.js

# Tell Docker about the port we'll run on.
EXPOSE 3000
