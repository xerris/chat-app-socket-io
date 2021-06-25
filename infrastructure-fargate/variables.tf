# variables.tf

variable "aws_region" {
  description = "The AWS region things are created in"
  default     = "us-east-2"
}

variable "ecs_task_execution_role_name" {
  description = "ECS task execution role name"
  default     = "myEcsTaskExecutionRole"
}

variable "ecs_task_role_name" {
  description = "ECS task execution role name"
  default     = "myEcsTaskRole"
}


variable "az_count" {
  description = "Number of AZs to cover in a given region"
  default     = "2"
}

variable "app_image" {
  description = "Docker image to run in the ECS cluster"
  default     = "alexhladun/xerris-socket-app:latest"
}

variable "app_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 3001
}

variable "app_count" {
  description = "Number of docker containers to run"
  default     = 2
}

variable "health_check_path" {
  default = "/"
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = "1024"
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = "2048"
}


variable "images_to_keep" {
  description = "Number of ECR images to keep before cleaning"
  default     = 10
}

variable "env" {
  description = "Environemnt"
  default     = "dev"
}

variable "ecr_name" {
  description = "ECR registry name"
  default     = "dev"
}

variable "dynamodb_table_name" {
  description = "table name for Dynamo table"
  default     = "dev-socket-app-terraform-state-lock"
}

variable "amis" {
  description = "AMIs by region"
  default = {
    us-east-2 = "ami-XXXX" # ubuntu 14.04 LTS
  }
}
