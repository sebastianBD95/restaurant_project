output "api_url_ec2" {
  description = "EC2 public URL for the API (HTTP)"
  value       = "http://${aws_instance.app.public_dns}"
}

output "nameservers" {
  description = "Set these at your domain registrar."
  value       = aws_route53_zone.root.name_servers
}

output "frontend_url" {
  value = "https://${var.frontend_subdomain}.${var.root_domain}"
}

output "api_url" {
  value = "https://${var.api_subdomain}.${var.root_domain}"
}

output "zone_id" { 
  value = aws_route53_zone.root.zone_id 
}