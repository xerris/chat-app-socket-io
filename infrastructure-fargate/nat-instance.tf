

resource "aws_security_group" "nat" {
  name        = "vpc_nat"
  description = "Allow traffic to pass from the private subnet to the internet"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  vpc_id = aws_vpc.main.id


}



resource "aws_instance" "nat" {
  ami                    = "ami-001e4628006fd3582" # this is a special ami preconfigured to do NAT
  availability_zone      = data.aws_availability_zones.available.names[count.index]
  count                  = var.az_count
  instance_type          = "t2.micro"
  key_name               = "aws"
  vpc_security_group_ids = ["${aws_security_group.nat.id}"]
  subnet_id              = element(aws_subnet.public.*.id, count.index)
  # subnet_id                   = element(aws_subnet.public.*.id, 0)
  associate_public_ip_address = true
  source_dest_check           = false

  tags = {
    Name = "NAT-Gateway"
  }
}

resource "aws_eip" "nat" {
  count    = var.az_count
  instance = element(aws_instance.nat.*.id, count.index)
  vpc      = true
}

resource "aws_security_group" "web" {
  name        = "vpc_web"
  description = "Allow incoming HTTP connections."

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }


  egress { # SQL Server
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress { # SQL Server
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }


  vpc_id = aws_vpc.main.id

  tags = {
    Name = "WebServerSG"
  }
}

resource "aws_instance" "web-1" {
  ami                         = lookup(var.amis, var.aws_region)
  count                       = var.az_count
  availability_zone           = data.aws_availability_zones.available.names[count.index]
  instance_type               = "t2.micro"
  key_name                    = "aws"
  vpc_security_group_ids      = ["${aws_security_group.web.id}"]
  subnet_id                   = element(aws_subnet.public.*.id, count.index)
  associate_public_ip_address = true
  source_dest_check           = false


  tags = {
    Name = "Web Server 1"
  }
}

resource "aws_eip" "web-1" {
  count    = var.az_count
  instance = element(aws_instance.web-1.*.id, count.index)
  vpc      = true
}
