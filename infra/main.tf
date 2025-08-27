# Keeps state in S3 (recommended). Leave the block empty and pass values
# via -backend-config on `terraform init` so you don’t hard-code secrets.

terraform {
  backend "s3" {}
}