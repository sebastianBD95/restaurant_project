resource "aws_ecr_repository" "backend" {
  name = "${local.name}-backend"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  tags = local.tags
}

output "ecr_repository_url" { value = aws_ecr_repository.backend.repository_url }