#!/bin/sh
set -e

# configuration
name="api"
registry=${ECR_REGISTRY_URL}

export AWS_DEFAULT_REGION=eu-central-1

# create version name
version=`date +%Y%m%d-%H%M`

# display version
echo "Building version: ${CLUSTER}:${SERVICE}:${version} with branch ${BRANCH}"

# parse arguments
for argument in "$@"; do
    if [ "$argument" == "--no-cache" ]
    then
        echo "Building docker image with: --no-cache"
        cache_flag=$argument
    fi
done

# get ECR login for docker
if ecr_password=$(aws ecr get-login-password --region ${AWS_DEFAULT_REGION}); then
    # run docker auth
    eval echo "$ecr_password" | docker login --username AWS --password-stdin $registry

echo "SECRET_MANAGER_ARN --- ${SECRET_MANAGER_ARN}"
# build docker image
   if docker build -f Dockerfile -t ${name}:${version} --build-arg branch=${BRANCH} --build-arg secret_manager_arn=${SECRET_MANAGER_ARN} . ${cache_flag}; then

        # create tags
        docker tag ${name}:${version} ${registry}/${name}:${version}
        docker tag ${name}:${version} ${registry}/${name}:${SERVICE}
        docker tag ${name}:${version} ${registry}/${name}:latest

        # push to repository
        docker push ${registry}/${name}:${version}
        docker push ${registry}/${name}:${SERVICE}
        docker push ${registry}/${name}:latest

        # delete local tags
        docker rmi ${registry}/${name}:${version}
        docker rmi ${registry}/${name}:${SERVICE}
        docker rmi ${registry}/${name}:latest

        # deploy docker image
        if aws ecs update-service --force-new-deployment --cluster ${CLUSTER} --service ${SERVICE}; then
            echo "Version built and deployed: ${CLUSTER}:${SERVICE}:${version}"
        else
            echo "AWS ECS deployment failed."
            exit 1
        fi

    else
        echo "Docker image build failed."
        exit 1
    fi

else
    echo "AWS ECR authentication failed."
    exit 1
fi
