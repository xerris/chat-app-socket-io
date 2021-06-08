# How to Create a Chat App With Socket.io

This repository contains an implementation of a real-time chat application using Socket.io.

Deployment can also be done to multiple EC2 instances on AWS with a terraform script. It will deploy the appropriate networking tools and Redis instance to connect multiple apps.

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

## Starting the Application Locally

The server and client are two separate applications, they must both be running in parrallel. You will need to rename the .env.example files in client/ and server/ to .env

## Run REDIS Client locally

[Download Redis here](https://redis.io/topics/quickstart), and run `redis-server` in a terminal.
## Run Client & Server

```
npm run dev
```


# Deploying our app to a Fargate Cluster with CI/CD
These steps will create the following resources in your AWS Account:

- ECS task which runs our socket-app Docker image via Fargate
- ECS service which runs our task
- ECS cluster which runs our service
- VPC
- Internet Gateway
- Subnet
- Route Table & associated to subnet
- Application Load Balancer that will point at our ECS cluster
- AWS Redis Elasticache cluster
- Public security group with port 3001 open for public access to our app
- Private security group for internal communication between ECS, our ALB and Redis.

These services mostly fall within the free tier, but you may be charged for extensive use. Always remember to run `terraform destroy` in order to avoid extra costs.


## 1) Create S3 bucket and DynamoDB table to hold the terraform state lock-file.

This is crucial as terraform will use this to reference the resources you created in order to update/destroy them later!

- Go to S3 in the console and create an S3 bucket with a unique name.
- Go to DynamoDB in the console and create a table. The name doesn't matter, but the Primary partition key should be 'LockID' and type string.
- Add these names to /infrastructure-fargate/terraform-exec.sh under bucket=<name> and dynamodb_table=<name>
## 2) Deploy infrastructure

You will need to fork this repository, and create an AWS account with proper permissions to create the resources. Then, connect your github account to CircleCI and set up the project (choose 'existing configuration' when it asks).

Create the following Context variables in CircleCI under 'Organization Settings':
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION (ie us-east-2)
- ENV (prod)
- REACT_APP_ENV (prod)
- REDIS_PORT (6379)

Then in CircleCI, approve the 'hold-deploy-infrastructure' step. Your AWS resources will be created.

## 3) Deploy app

This will build a docker image for your app and deploy it to your newly created ECR repository. From there, a fargate cluster will be created that can scale automatically.

You firrst need to navigate to your AWS account and find the endpoint for your Redis Elasticache cluster (xerris-redis-cluster.XXXXXX.#####.xyz.cache.amazonaws.com
), and the ECR repo endpoint (12345.dkr.ecr.us-east-2.amazonaws.com/xerris-socket-app-repo) that were created in step 1.

You need to put these Context variables into CircleCI as well, under REDIS_ENDPOINT and AWS_ECR_ACCOUNT_URL, respectively.

Next, you can approve the 'hold-deploy-app' step in CircleCI, to build & deploy the app.

If you did everything right, you should be able to go to EC2 > Application Load Balancer in the AWS console and find your load balancer URL. Add port 3001 on the end and you're good to go!

## 4) Teardown
Approve the 'hold-DESTROY' step in CircleCI to tear down your infrastructure.



## Resources used

[Deploying to Fargate](https://medium.com/@bradford_hamilton/deploying-containers-on-amazons-ecs-using-fargate-and-terraform-part-2-2e6f6a3a957f)

[Creating a Docker Image](https://dev.to/dariansampare/setting-up-docker-typescript-node-hot-reloading-code-changes-in-a-running-container-2b2f)

[Socket.io Messaging Example](https://socket.io/get-started/private-messaging-part-1/)

