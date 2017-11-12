zip -r app.zip . -x \*client* \*.git*
aws lambda update-function-code --region us-east-1 --function-name getReadings --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
aws lambda update-function-code --region us-east-1 --function-name getLatestReading --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
aws lambda update-function-code --region us-east-1 --function-name cleanFutureRows --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
aws lambda update-function-code --region us-east-1 --function-name getSampleReadings --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
aws lambda update-function-code --region us-east-1 --function-name resetReadings --zip-file fileb:///Users/hob.spillane/code/thermolambda/lambdas/app.zip
rm -f app.zip
