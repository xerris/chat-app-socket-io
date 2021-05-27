#!/bin/bash

echo "###############################"
echo "## Starting Terraform script ##"
echo "###############################"

#If var true apply  will be exec
APPLY=$1
echo "${ENV}"
echo "${AWS_REGION}"
terraform init \
  -backend-config="bucket=terraform-state-socket-app-${ENV}" \
  -backend-config="key=${ENV}/platform-infra.tfstate" \
  -backend-config="dynamodb_table=${ENV}-socket-app-terraform-state-lock" \
  -backend-config="region=${AWS_REGION}"

terraform validate
terraform plan -var-file=envs/${ENV}.tfvars

if [ $APPLY == 1 ]; then
  echo "###############################"
  echo "## Executing terraform apply ##"
  echo "###############################"
  terraform apply --auto-approve -var-file=envs/${ENV}.tfvars
fi

# aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin XXXXXXXXXXX.dkr.ecr.<REGION>.amazonaws.com/