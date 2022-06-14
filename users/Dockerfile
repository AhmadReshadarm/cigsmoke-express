FROM node:15-alpine

RUN mkdir -p /app/core
RUN mkdir -p /app/users

WORKDIR /app/users
COPY . .
RUN npm install

WORKDIR /app/core
RUN cd ../core
COPY . .

WORKDIR /app
RUN cd /
COPY ../package.json ./package.json
COPY ../tsconfig.json ./tsconfig.json
RUN npm install

EXPOSE 4001

WORKDIR /app/users
RUN npm run build
RUN npm run start
#CMD [ "node", "orders.js" ]