FROM node:14.15.5 as base
WORKDIR /usr/src/
COPY package*.json ./
RUN npm install
COPY . .
FROM base as production
ENV NODE_PATH=./dist
RUN npm run build --mount=type=secret,id=aws,target=$HOME/.aws/credentials 
EXPOSE 3001
CMD [ "node", "dist/index.js" ]