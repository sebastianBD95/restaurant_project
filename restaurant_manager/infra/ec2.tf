resource "aws_security_group" "app" {
  name        = "${local.name}-app-sg"
  description = "Security group for the application"
  vpc_id      = aws_vpc.main.id
  tags        = local.tags
  # HTTP for API; swap to 443 with Nginx/Caddy later
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }
  # SSH (optional): restrict to your IP or disable entirely
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "al2023_arm" {
  most_recent = true
  owners      = ["137112412989"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-arm64"]
  }
}
# User data: install Docker, login to ECR, run your container

locals {
  user_data = <<-EOF
    #!/bin/bash
    set -eux
    dnf update -y
    dnf install -y docker awscli
    systemctl enable --now docker
    # ECR login
    aws ecr get-login-password --region ${var.region} | docker login --username AWS --password-stdin ${aws_ecr_repository.backend.repository_url}
    # Pull and run app (replace :latest if you use semantic tags)
    docker pull ${aws_ecr_repository.backend.repository_url}:latest || true
    # Simple API on port 80 (if your Go app listens on 8080, add -p 80:8080)
    docker run -d --restart always --name app -p 80:8080 \
      -e DB_HOST=${aws_db_instance.pg.address} \
      -e DB_USER=${var.db_username} \
      -e DB_PASS='${var.db_password}' \
      -e DB_NAME=${var.db_name} \
      ${aws_ecr_repository.backend.repository_url}:latest
  EOF
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023_arm.id
  instance_type          = var.ec2_instance_type
  subnet_id              = values(aws_subnet.public)[0].id
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.app.id]
  user_data              = local.user_data

  tags = merge(local.tags, { Name = "${local.name}-app" })
}

# Allocate a static Elastic IP and associate to the instance
resource "aws_eip" "app" {
  domain = "vpc"
  tags   = merge(local.tags, { Name = "${local.name}-eip" })
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}

output "app_public_ip" { value = aws_instance.app.public_ip }
output "app_public_dns" { value = aws_instance.app.public_dns }
