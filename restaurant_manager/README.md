# Aws setup

- S3: https://us-east-1.console.aws.amazon.com/s3/buckets/servu-web?region=us-east-1&bucketType=general&tab=objects
- cognito: https://us-east-1.console.aws.amazon.com/cognito/v2/identity/identity-pools/us-east-1:8c2aa372-217b-46f0-846b-a8003a45973d/user-statistics?region=us-east-1
- IAM: 
    -Roles: https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/roles/details/Servu-backend?section=permissions


#go test report

go test -json ./tests/integration/... | go-test-report