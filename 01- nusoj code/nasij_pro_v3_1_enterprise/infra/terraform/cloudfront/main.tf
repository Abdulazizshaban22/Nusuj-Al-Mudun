
terraform {
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
}
provider "aws" { region = var.region }
resource "aws_s3_bucket" "cdn" { bucket = var.bucket_name }
resource "aws_cloudfront_distribution" "cdn" {
  enabled = true
  origin { domain_name = aws_s3_bucket.cdn.bucket_regional_domain_name origin_id = "s3origin" }
  default_cache_behavior {
    target_origin_id = "s3origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["GET","HEAD"]
    cached_methods = ["GET","HEAD"]
  }
  viewer_certificate { cloudfront_default_certificate = true }
}
variable "region" { default = "us-east-1" }
variable "bucket_name" { default = "nasij-cdn" }
output "cdn_domain" { value = aws_cloudfront_distribution.cdn.domain_name }
