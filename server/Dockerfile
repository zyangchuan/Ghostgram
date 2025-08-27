FROM node:18-alpine
RUN npm install --global nodemon
WORKDIR /app
COPY package*.json .
RUN npm install && npm install pm2 -g
COPY . .
EXPOSE 5000