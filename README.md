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


## 3a) Option 1: Deploy infrastructure with CircleCI (CI/CD)
You will need to fork this repository, and create an AWS account with proper permissions to create the resources.

Create a S3 bucket and DynamoDB table to hold the terraform state lock file. This is crucial as terraform will use this to reference the resources you created in order to update/destroy them later!
- Go to S3 in the console and create an S3 bucket with a unique name. 
- Go to DynamoDB in the console and create a table. The name doesn't matter, but the Primary partition key should be 'LockID' and type string.
- Add these names to /infrastructure-fargate/terraform-exec.sh under bucket=<name> and dynamodb_table=<name>

Create the following Context variables in CircleCI:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION (ie us-east-2)
- ENV (prod)
- REACT_APP_ENV (prod)
- REDIS_PORT (6379)

Then in CircleCI, approve the 'hold-deploy-infrastructure' step. Your AWS resources will be created. 
You then need to navigate to your AWS account and find the endpoint for your Redis Elasticache cluster (xerris-redis-cluster.XXXXXX.#####.xyz.cache.amazonaws.com
), and the ECR repo endpoint (12345.dkr.ecr.us-east-2.amazonaws.com/xerris-socket-app-repo)

You need to put these Context variables into CircleCI as well, under REDIS_ENDPOINT and AWS_ECR_ACCOUNT_URL, respectively.

Next, you can approve the 'hold-deploy-app' step in CircleCI, to build & deploy the app. 

If you did everything right, you should be able to go to EC2 > Application Load Balancer in the AWS console and find your load balancer URL. Add port 3001 on the end and you're good to go! Skip the steps below, and approve the 'hold-DESTROY' step in CircleCI to tear down your infrastructure.

## 3b) Option 2: Build and deploy to multiple EC2 instances with Terraform shell script (locally)

- This will skip step 4 below
- Make sure you are logged in to docker with `docker login`
- Set your Docker username and password in the ./infrastructure/.env file, following the convention set in .env.example
- Run `sh terraform_exec 1` within the infrastructure/ folder and your infrastructure will be built, code will be dockerized and pushed to docker.
- Go to step 5.

## 3c) Option 3: Deploy to an AWS ECS Cluster with Fargate and Terraform (locally)

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
