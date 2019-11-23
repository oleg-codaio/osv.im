variable "name" {
  description = "Name identifying the created bucket and resources"
}

variable "zone_id" {
  description = "The ID of the Route 53 hosted zone within which to create this stack"
}

variable "acm_ssl_cert_arn" {
  description = "The ARN of the SSL certificate to be used by CloudFront"
}

variable "bucket_prefix" {
  description = "The prefix to assign to the created regional S3"
  default     = "osv-im-us-west-2"
}

variable "inaccessible_page_path" {
  description = "The path to the page to use for 404/403s"
  default     = "/404.html"
}

variable "shortcuts" {
  description = "A map of short URLs with redirect URLs"
  default     = {}
}
