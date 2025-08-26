resource "aws_db_subnet_group" "pg" {
  name       = "${local.name}-dn-subnet"
  subnet_ids = [for s in aws_subnet.private : s.id]
  tags       = local.tags
}

resource "aws_security_group" "pg" {
  name        = "${local.name}-pg-sg"
  description = "Security group for the PostgreSQL instance"
  vpc_id      = aws_vpc.main.id
  tags        = local.tags
}

resource "aws_db_instance" "pg" {
  identifier              = "${local.name}-pg"
  engine                  = "postgres"
  engine_version          = "16.4"
  instance_class          = var.db_instance
  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password
  allocated_storage       = 20
  storage_type            = "gp3"
  multi_az                = false
  publicly_accessible     = false
  skip_final_snapshot     = true
  db_subnet_group_name    = aws_db_subnet_group.pg.name
  vpc_security_group_ids  = [aws_security_group.pg.id]
  backup_retention_period = 7
  deletion_protection     = false
  tags                    = local.tags
}

output "db_endpoint" { value = aws_db_instance.pg.address }