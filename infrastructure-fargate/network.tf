# network.tf

# Fetch AZs in the current region
data "aws_availability_zones" "available" {
}

resource "aws_vpc" "main" {
  cidr_block = "172.17.0.0/16"
}

# Create var.az_count private subnets, each in a different AZ
resource "aws_subnet" "private" {
  count             = var.az_count
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  vpc_id            = aws_vpc.main.id
}

# Create var.az_count public subnets, each in a different AZ
resource "aws_subnet" "public" {
  count                   = var.az_count
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, var.az_count + count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  vpc_id                  = aws_vpc.main.id
  map_public_ip_on_launch = true
}

# Internet Gateway for the public subnet
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

# Route the public subnet traffic through the IGW
resource "aws_route" "internet_access" {
  route_table_id         = aws_vpc.main.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gw.id
}

# Create a NAT gateway with an Elastic IP for each private subnet to get internet connectivity
resource "aws_eip" "gw" {
  count      = var.az_count
  vpc        = true
  depends_on = [aws_internet_gateway.gw]
}

resource "aws_nat_gateway" "gw" {
  count         = var.az_count
  subnet_id     = element(aws_subnet.public.*.id, count.index)
  allocation_id = element(aws_eip.gw.*.id, count.index)
}

# Create a new route table for the private subnets, make it route non-local traffic through the NAT gateway to the internet
resource "aws_route_table" "private" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.gw.*.id, count.index)
  }
}

# Explicitly associate the newly created route tables to the private subnets (so they don't default to the main route table)
resource "aws_route_table_association" "private" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.aws_region}.s3"
 vpc_endpoint_type = "Gateway"
 route_table_ids = [aws_route_table.private[0].id]
 policy = data.aws_iam_policy_document.s3_ecr_access.json

}


resource "aws_vpc_endpoint" "ecr-dkr-endpoint" {
  vpc_id       = aws_vpc.main.id
 private_dns_enabled = true
  service_name = "com.amazonaws.${var.aws_region}.ecr.dkr"
 vpc_endpoint_type = "Interface"
 security_group_ids = [aws_security_group.ecs_task.id]
 subnet_ids = "${aws_subnet.private.*.id}"

}

resource "aws_vpc_endpoint" "ecr-api-endpoint" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.aws_region}.ecr.api"
 vpc_endpoint_type = "Interface"
 private_dns_enabled = true
 security_group_ids = [aws_security_group.ecs_task.id]
 subnet_ids = "${aws_subnet.private.*.id}"
}
resource "aws_vpc_endpoint" "ecs-agent" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.aws_region}.ecs-agent"
 vpc_endpoint_type = "Interface"
 private_dns_enabled = true
 security_group_ids = [aws_security_group.ecs_task.id]
 subnet_ids = "${aws_subnet.private.*.id}"


}
resource "aws_vpc_endpoint" "ecs-telemetry" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.aws_region}.ecs-telemetry"
 vpc_endpoint_type = "Interface"
 private_dns_enabled = true
 security_group_ids = [aws_security_group.ecs_task.id]
 subnet_ids = "${aws_subnet.private.*.id}"

}
resource "aws_vpc_endpoint" "ecs-endpoint" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.aws_region}.ecs-agent"
 vpc_endpoint_type = "Interface"
 private_dns_enabled = true
 security_group_ids = [aws_security_group.ecs_task.id]
 subnet_ids = "${aws_subnet.private.*.id}"

}
