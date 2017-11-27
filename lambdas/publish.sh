#!/bin/sh

usage()
{
cat << EOF
usage: $0 [-a | <functionName>] -m <meta-data-folder> [-c <logging-config>]

This script publishes Pyro lambda functions to AWS Lambda.  Specify a functionName to publish or publish all.

OPTIONS:
   -h      Show this message
   -a      Publish all Pyro functions
EOF
}

while getopts "ha" OPTION
do
  case $OPTION in
    h)
      usage
      exit 1
      ;;
    a)
      # Publish all
      ALL=true
  esac
done


# Setup
zip -r app.zip . -x \*client* \*.git*

if [[ -z $ALL ]]
then
  FUNC_NAME=$1
  echo "Publishing $FUNC_NAME"
  aws lambda update-function-code --region us-east-1 --function-name $FUNC_NAME --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
else
  echo "Publishing all functions"
  aws lambda update-function-code --region us-east-1 --function-name getReadings --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
  aws lambda update-function-code --region us-east-1 --function-name getLatestReading --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
  aws lambda update-function-code --region us-east-1 --function-name cleanFutureRows --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
  aws lambda update-function-code --region us-east-1 --function-name resetReadings --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
  aws lambda update-function-code --region us-east-1 --function-name createReading --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
fi

# Clean-up
rm -f app.zip
