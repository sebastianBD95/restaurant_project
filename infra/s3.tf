resource "aws_s3_bucket" "migrations" {
  bucket = var.migrations_bucket
  tags   = { Project = "servu", Purpose = "db-migrations" }
}

resource "aws_s3_bucket_public_access_block" "migrations" {
  bucket                  = aws_s3_bucket.migrations.id
  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true
}

# No versioning (cheapest); remove the versioning resource entirely.

resource "aws_s3_bucket_server_side_encryption_configuration" "migrations" {
  bucket = aws_s3_bucket.migrations.id
  rule { 
    apply_server_side_encryption_by_default { 
        sse_algorithm = "AES256"
     } 
  }
}


resource "aws_s3_bucket_lifecycle_configuration" "migrations" {
  bucket = aws_s3_bucket.migrations.id
  rule {
    id     = "expire-migrations"
    status = "Enabled"
    filter { prefix = "migrations/" }
        expiration { days = 14 }
    }
    }

    resource "aws_s3_bucket_policy" "migrations" {
    bucket = aws_s3_bucket.migrations.id
    policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Sid      = "DenyInsecureTransport",
      Effect   = "Deny",
      Action   = "s3:*",
      Principal= "*",
      Resource = [
        "arn:aws:s3:::${aws_s3_bucket.migrations.bucket}",
        "arn:aws:s3:::${aws_s3_bucket.migrations.bucket}/*"
      ],
      Condition = { Bool = { "aws:SecureTransport": "false" } }
    }]
  })
}