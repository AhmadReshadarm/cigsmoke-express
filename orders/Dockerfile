FROM node:15-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4001
RUN npm run start
#CMD [ "node", "orders.js" ]