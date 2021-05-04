FROM node:14.15.5 as base

WORKDIR /usr/src/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001
CMD [ "nodemon", "dist/index.js" ]