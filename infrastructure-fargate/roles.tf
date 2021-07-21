# ECS task execution role data
data "aws_iam_policy_document" "ecs_task_execution_role" {
  version = "2012-10-17"
  statement {
    sid     = ""
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}


# ECS task execution role
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = var.ecs_task_execution_role_name
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json
}

# ECS task execution role policy attachment

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_dyanmo" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# ECS task role data (So our container can contact AWS APIs ie dynamodb)
data "aws_iam_policy_document" "ecs_task_role" {
  version = "2012-10-17"

  statement {
    sid       = "afs1"
    effect    = "Allow"
    actions   = ["dynamodb:*"]
    resources = ["${aws_dynamodb_table.dynamodb-table.arn}", "${aws_dynamodb_table.dynamodb-table.arn}/index/SK-PK-inverted-index"]
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name               = var.ecs_task_role_name
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json
}
# Attach ECS TaskExecution role
resource "aws_iam_role_policy_attachment" "ecs_task_role" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "ecs_task" {
  name   = "ecs_task_policy"
  policy = data.aws_iam_policy_document.ecs_task_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_role_permissions" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task.arn
}


data "aws_iam_policy_document" "s3_ecr_access" {
  version = "2012-10-17"
  statement {
    sid     = "s3access"
    effect  = "Allow"
    actions = ["*"]

    principals {
      type        = "*"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}
