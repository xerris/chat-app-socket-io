aws_region = "us-east-2"
ecr_name = "xerris-socket-app-repo"
dynamodb_table_name = "dev-socket-app-terraform-state-lock"
env = "dev"
images_to_keep= 10
app_image = "253896803446.dkr.ecr.us-east-2.amazonaws.com/xerris-socket-app-repo/xerris-socket-app:latest"