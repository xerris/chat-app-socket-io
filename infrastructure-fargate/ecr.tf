# resource "aws_ecr_repository" "socket-app-repository" {
#   name                 = "xerris-socket-app-repo"
#   image_tag_mutability = "IMMUTABLE"
# }

# resource "aws_ecr_repository_policy" "socket-app-policy" {
#   repository = aws_ecr_repository.socket-app-repository.name
#   policy     = <<EOF
#   {
#     "Version": "2008-10-17",
#     "Statement": [
#       {
#         "Sid": "Full ECR access to socket-app repository",
#         "Effect": "Allow",
#         "Principal": "*",
#         "Action": [
#           "ecr:BatchCheckLayerAvailability",
#           "ecr:BatchGetImage",
#           "ecr:CompleteLayerUpload",
#           "ecr:GetDownloadUrlForLayer",
#           "ecr:GetLifecyclePolicy",
#           "ecr:InitiateLayerUpload",
#           "ecr:PutImage",
#           "ecr:UploadLayerPart"
#         ]
#       }
#     ]
#   }
#   EOF
# }