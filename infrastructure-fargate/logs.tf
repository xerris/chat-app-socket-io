# logs.tf

# Set up CloudWatch group and log stream and retain logs for 30 days
resource "aws_cloudwatch_log_group" "cb_log_group" {
  name              = "/ecs/xerris-app"
  retention_in_days = 30

  tags = {
    Name = "xerris-log-group"
  }
}

resource "aws_cloudwatch_log_stream" "cb_log_stream" {
  name           = "xerris-log-stream"
  log_group_name = aws_cloudwatch_log_group.cb_log_group.name
}

