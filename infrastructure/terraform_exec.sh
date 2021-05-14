#!/bin/bash

read_var() {
  VAR=$(grep $1 $2 | xargs)
  IFS="=" read -ra VAR <<<"$VAR"
  echo ${VAR[1]}
}

echo "###############################"
echo "## ASSIGNING DOCKER CREDENTIALS TO USERDATA FROM .ENV ##"
echo "###############################"

DOCKER_USERNAME=$(read_var DOCKER_USERNAME .env)
DOCKER_PASSWORD=$(read_var DOCKER_PASSWORD .env)
 echo "
  #! /bin/bash
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
chkconfig docker on
docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
docker pull ${DOCKER_USERNAME}/xerris-socket-app
docker run -t -i -p 3001:3001 ${DOCKER_USERNAME}/xerris-socket-app
    " >user_data.sh


echo "###############################"
echo "## Starting Terraform script ##"
echo "###############################"

#If var true apply  will be exec
APPLY=$1
echo "${ENV}"
echo "${AWS_REGION}"

terraform init
terraform validate
terraform plan
terraform output -raw configuration_endpoint_address
rm -r ../server/build/
ls

if [ $APPLY == 1 ]; then
  echo "###############################"
  echo "## Executing terraform apply ##"
  echo "###############################"
  terraform apply --auto-approve
  redis_endpoint=$(cat redis_endpoint.txt)
  echo "Your redis endpoint: $redis_endpoint"
  cd ../client
  rm .env
  echo "REACT_APP_ENV=prod" >.env
  npm run build
  cd ../server/
  rm .env
  echo "
    ENV=prod
    REDIS_ENDPOINT_2=localhost
    REDIS_ENDPOINT=${redis_endpoint}
    REDIS_PORT=6379
    " >.env
  docker build . -t xerris-socket-app
  docker tag xerris-socket-app $DOCKER_USERNAME/xerris-socket-app
  docker push $DOCKER_USERNAME/xerris-socket-app
fi

# Run docker
