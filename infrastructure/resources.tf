#providers
provider "aws" {
  # access_key = var.access_key
  # secret_key = var.secret_key
  region = var.region
}

#resources
resource "aws_vpc" "vpc" {
  cidr_block           = var.cidr_vpc
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    "Environment" = var.environment_tag
    "Name"        = "xerris-socket-app"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    "Environment" = var.environment_tag
    "Name"        = "xerris-socket-app"
  }
}

resource "aws_subnet" "subnet_public" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.cidr_subnet
  map_public_ip_on_launch = "true"
  availability_zone       = var.availability_zone
  tags = {
    "Environment" = var.environment_tag
    "Name"        = "xerris-socket-app"
  }
}

resource "aws_route_table" "rtb_public" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    "Environment" = var.environment_tag
    "Name"        = "xerris-socket-app"
  }
}

resource "aws_route_table_association" "rta_subnet_public" {
  subnet_id      = aws_subnet.subnet_public.id
  route_table_id = aws_route_table.rtb_public.id
}

resource "aws_security_group" "sg_22" {
  name   = "sg_22"
  vpc_id = aws_vpc.vpc.id

  # SSH access from the VPC
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    "Environment" = var.environment_tag
    "Name"        = "xerris-socket-app"
  }
}

resource "aws_key_pair" "ec2key" {
  key_name   = "publicKey"
  public_key = file(var.public_key_path)
}

resource "aws_instance" "instance1" {
  ami                    = var.instance_ami
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.subnet_public.id
  vpc_security_group_ids = [aws_security_group.sg_22.id]
  key_name               = aws_key_pair.ec2key.key_name
  user_data              = file("user_data.sh")
  tags = {
    "Environment" = var.environment_tag
    "Name"        = "xerris-socket-app"
  }
}
resource "aws_instance" "instance2" {
  ami                    = var.instance_ami
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.subnet_public.id
  vpc_security_group_ids = [aws_security_group.sg_22.id]
  key_name               = aws_key_pair.ec2key.key_name
  user_data              = file("user_data.sh")
  tags = {
    "Environment" = var.environment_tag
    "Name"        = "xerris-socket-app"
  }
}
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "redis-subnet-group"
  subnet_ids = [aws_subnet.subnet_public.id]
}
resource "aws_elasticache_cluster" "redisCluster" {
  cluster_id           = "xerris-redis-cluster"
  engine               = "redis"
  node_type            = "cache.t2.micro"
  availability_zone    = "us-east-2a"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis3.2"
  engine_version       = "3.2.10"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = [aws_security_group.sg_22.id]
}

resource "local_file" "instance_ips" {
  content  = aws_elasticache_cluster.redisCluster.cache_nodes[0].address
  filename = "${path.module}/redis_endpoint.txt"
}
