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

The server and client are two separate applications, they must both be running in parallel. You will need to rename the .env.example files in client/ and server/ to .env

## Run Client & Server

```
npm run dev
```

# Deploying to AWS

## 1) Set up AWS CLI with profile

[Follow this tutorial and login to set up your secret key and access key](https://docs.aws.amazon.com/polly/latest/dg/setup-aws-cli.html). This is required to deploy resources to AWS through the Terraform code.

## 2a) Build and deploy with Terraform shell script

- This will skip step 2 and 3 below
- Make sure you are logged in to docker with `docker login`
- Set your Docker username and password in the ./infrastructure/.env file, following the convention set in .env.example
- Run `sh terraform_exec 1` and your infrastructure will be built, code will be dockerized and pushed to docker. Go to step 4.

## 2b) Deploy infrastructure with Terraform

[You will first need to install the Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli)

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

## 3) Build Docker Image

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

## 4) Connect to instance

```
cd ~/.ssh
chmod 400 id_rsa.pub
ssh -i id_rsa ec2-user@<IPV4 ADDRESS OF EC2 INSTANCE>
```

## 5) Deploy App to EC2 Instance

Your EC2 instance included the user_data script in infrastructure, so it should be updated and have docker installed & running when you SSH into it.

If you didn't follow step 2a, run the following:

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

## Teardown

Run `terraform destroy` to remove the AWS resources you created

# Scaling

## Sticky load balancing

If you plan to distribute the load of connections among different processes or machines, you have to make sure that all requests associated with a particular session ID reach the process that originated them. This means enabling sticky-connections for any load balancers.
