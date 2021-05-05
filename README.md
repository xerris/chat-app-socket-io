# How to Create a Chat App With Socket.io
This repository contains an implementation of a real-time chat application using Socket.io.

# Setup

## Prerequisites
First, ensure that you have the following installed:
1. NodeJS
2. Git
   
## Clone the project
```
git clone https://github.com/xerris/chat-app-socket-io.git
```

## Install Dependencies
The server and client are two separate applications, their dependencies must be installed individually.

## Server
```
cd server
npm install
```

## Client
```
cd client
npm install
```
## Starting the Application
The server and client are two separate applications, they must both be running in parrallel.

## Run Client & Server
```
npm dev
```

## Build Docker Image
```
cd client
npm run build

cd ../server
docker build . -t xerris-socket-app
docker tag xerris-socket-app <YOUR_DOCKER_USERNAME>/xerris-socket-app
````
