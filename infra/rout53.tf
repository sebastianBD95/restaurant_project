# Hosted zone for your domain
resource "aws_route53_zone" "root" {
  name = var.root_domain
}

# Temporary: Adding back ACM certificate to destroy it
resource "aws_acm_certificate" "cdn" {
  provider                  = aws.us_east_1
  domain_name               = "${var.frontend_subdomain}.${var.root_domain}"
  subject_alternative_names = [var.root_domain] # optional apex
  validation_method         = "DNS"
  tags                      = { Purpose = "Frontend CDN cert" }
}

# DNS validation records
resource "aws_route53_record" "cdn_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cdn.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
  zone_id = aws_route53_zone.root.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.value]
}

resource "aws_acm_certificate_validation" "cdn" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cdn.arn
  validation_record_fqdns = [for r in aws_route53_record.cdn_validation : r.fqdn]
}

# Frontend: app.<domain> -> EC2 public IP (for Docker container)
resource "aws_route53_record" "frontend_a" {
  zone_id = aws_route53_zone.root.zone_id
  name    = "${var.frontend_subdomain}.${var.root_domain}"
  type    = "A"
  ttl     = 60
  records = [aws_eip.app.public_ip] # uses EIP from step 4
}

# API: api.<domain> -> EC2 public IP (we'll add an Elastic IP in step 4)
resource "aws_route53_record" "api_a" {
  zone_id = aws_route53_zone.root.zone_id
  name    = "${var.api_subdomain}.${var.root_domain}"
  type    = "A"
  ttl     = 60
  records = [aws_eip.app.public_ip] # uses EIP from step 4
}