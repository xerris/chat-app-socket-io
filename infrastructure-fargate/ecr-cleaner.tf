# module "ecr_module"{
#     source = "git@github.com:xerris/aws-modules.git//ecr"
#     ecr_name = "xerris-socket-app-repo"
# }

# module "ecr_cleanup" {
#   source = "git@github.com:xerris/aws-modules.git//ecr/ecrCleaner"
#   env = var.env
#   region = var.aws_region
#   images_to_keep = var.images_to_keep
# }
