terraform {
  backend "s3" {
    bucket="terraform-state-socket-app-dev"
    key = "dev/merchant-app-infra.tfstate"
    region = "us-east-2"
  }
}