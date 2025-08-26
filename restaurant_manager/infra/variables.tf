variable "project" {
  type        = string
  description = "The name of the project"
  default     = "restaurant-app"
}

variable "region" {
  type        = string
  description = "The region to deploy the project"
  default     = "us-east-1"
}

variable "env" {
  type        = string
  description = "The environment to deploy the project"
  default     = "dev"
}

variable "vpc_cidr" {
  type        = string
  description = "The CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "public_cidrs" {
  type        = list(string)
  description = "The CIDR blocks for the public subnets"
  default     = ["10.20.0.0/24", "10.20.1.0/24"]
}

variable "private_cidrs" {
  type        = list(string)
  description = "The CIDR blocks for the private subnets"
  default     = ["10.20.10.0/24", "10.20.11.0/24"]
}

# EC2 Instance
variable "ec2_instance_type" {
  type        = string
  description = "The instance type for the EC2 instance"
  default     = "t4g.nano"
}

variable "admin_cidr" {
  type        = string
  description = "The CIDR block for the admin"
  default     = "0.0.0.0/0"
}

# DB basics

variable "db_name" {
  type        = string
  description = "The name of the database"
  default     = "restaurant_db"
}

variable "db_username" {
  type        = string
  description = "The username for the database"
  default     = "servu_app"
}

variable "db_password" {
  type        = string
  sensitive   = true
  nullable    = false
  description = "The password for the database"

}

variable "db_instance" {
  type        = string
  description = "The instance type for the database"
  default     = "db.t4g.micro"
}

variable "root_domain" {
  type        = string
  description = "The root domain for the project"
  default     = "servu.com.co"
}

variable "frontend_subdomain" {
  type        = string
  description = "The subdomain for the frontend"
  default     = "app"
}

variable "api_subdomain" {
  type        = string
  description = "The subdomain for the API"
  default     = "api"
}