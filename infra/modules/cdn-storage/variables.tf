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

variable "extra_aliases" {
  description = "Additional CNAME aliases for the CloudFront distribution"
  type        = list(string)
  default     = []
}

variable "redirect_www" {
  description = "Whether to issue a 301 HTTP redirect from www.domain to the root domain"
  type        = bool
  default     = false
}

variable "normalize_html_routes" {
  description = "Whether to serve extensionless HTML routes and redirect trailing-slash and index.html variants"
  type        = bool
  default     = false
}

variable "html_route_exclusions" {
  description = "Extensionless paths that must pass through without HTML route normalization"
  type        = list(string)
  default     = []
}
