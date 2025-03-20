FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y pdftk

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json /usr/src/app/
RUN npm ci

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]
