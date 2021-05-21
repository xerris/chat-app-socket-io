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

## Run Client & Server

```
npm run dev
```

## Run REDIS Client locally

[Download Redis here](https://redis.io/topics/quickstart), and run `redis-server` in a terminal.

# Deploying to AWS

## 1) Set up AWS CLI with profile

[Follow this tutorial and login to set up your secret key and access key](https://docs.aws.amazon.com/polly/latest/dg/setup-aws-cli.html). This is required to deploy resources to AWS through the Terraform code.

## 2) Install Terraform

[Do this by installing the Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli)

## 3a) Option 1: Build and deploy to multiple EC2 instances with Terraform shell script

- This will skip step 4 below
- Make sure you are logged in to docker with `docker login`
- Set your Docker username and password in the ./infrastructure/.env file, following the convention set in .env.example
- Run `sh terraform_exec 1` within the infrastructure/ folder and your infrastructure will be built, code will be dockerized and pushed to docker.
- Go to step 5.

## 3b) Option 2: Deploy to an AWS ECS Cluster with Fargate and Terraform

- This will use AWS ECS instead of multiple EC2 instances.
- Follow step 4 below, and then replace the app_image in infrastructure-fargate/variables.tf with <YOUR_DOCKER_USERNAME>/xerris-socket-app:latest
- Run the following in your terminal:

```
cd infrastructure-fargate
terraform init
terraform plan
terraform apply
```

This will create the following resources in your AWS Account:

- ECS task which runs our socket-app Docker image
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

It will also the hostname of our ALB for connecting. Once complete, you can go to <ALB_HOST_NAME>:3001 and connect to one of your ECS tasks.

## 3c) Option 3: Deploy infrastructure with Terraform manually

```
cd infrastructure
terraform init
terraform plan
terraform apply
```

This will create the following resources in your AWS Account:

- VPC
- Internet Gateway
- Subnet
- Route Table & associated to subnet
- Security group with ports opened for SSH & Public access
- Key-Pair to SSH into your instance (~/.ssh/id_rsa.pub)
- t2.micro EC2 Instance, which is free-tier eligible
- AWS Redis Elasticache cluster

It will also output some information for the resources you created, including the Public IPV4 address of the EC2 instance you created.

## 4) Build Docker Image

Docker and Docker CLI tool must be installed for this step. Use `docker login` to authenticate.

```
change environment to "PROD" in .env files in ./client and ./server
cd client
npm run build (moves build file to server directory)
cd ../server
docker build . -t xerris-socket-app
```

run the application with `docker run -t -i -p 3001:3001 socket-app` to make sure it works locally.

```
docker tag xerris-socket-app <YOUR_DOCKER_USERNAME>/xerris-socket-app
docker push <YOUR_DOCKER_USERNAME>/xerris-socket-app
```

## 5) Connect to instance

```
cd ~/.ssh
chmod 400 id_rsa.pub
ssh -i id_rsa ec2-user@<IPV4 ADDRESS OF EC2 INSTANCE>
```

## 6) Deploy App to EC2 Instance

Your EC2 instance included the user_data script in infrastructure, so it should be updated and have docker installed & running when you SSH into it.

If you are following step 3b, you will have to install docker manually by running the following in your EC2 instance:

```
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
chkconfig docker on
```

To pull and run your image, run the following:

```
docker login
docker pull <YOUR_DOCKER_USERNAME>/xerris-socket-app
docker run -t -i -p 3001:3001 <YOUR_DOCKER_USERNAME>/xerris-socket-app
```

Your application should now be accessable through your `<EC2 Instance IPv4>:3001` OR `<IPv4 DNS>:3001`

# Teardown (important!)

Run `terraform destroy` to remove the AWS resources you created.

## Resources used

[Deploying to Fargate](https://medium.com/@bradford_hamilton/deploying-containers-on-amazons-ecs-using-fargate-and-terraform-part-2-2e6f6a3a957f)

[Creating a Docker Image](https://dev.to/dariansampare/setting-up-docker-typescript-node-hot-reloading-code-changes-in-a-running-container-2b2f)
