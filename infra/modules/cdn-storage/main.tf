/**
 * Instantiates an S3-based CloudFront distribution on a given subdomain.
 */

locals {
  s3_origin_id = "S3-${var.name}"
  domain_name  = "${var.name != "root" ? "${var.name}." : ""}osv.im"
}

// Create an S3 bucket to hold these assets.
// Have it be public so that the CDN can access the website endpoint to enable
// S3 static hosting features like redirects to work.

resource "aws_s3_bucket" "root" {
  bucket = "${var.bucket_prefix}-${var.name}-assets"
  acl    = "private"

  versioning {
    enabled = true
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  tags = {
    Name = "Static assets for ${var.name}"
  }
}

// Set up an SSL-enabled CloudFront distribution.

resource "aws_cloudfront_distribution" "root" {
  origin {
    domain_name = aws_s3_bucket.root.website_endpoint
    origin_id   = local.s3_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  comment             = var.name
  aliases             = [local.domain_name]
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_ssl_cert_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.1_2016"
  }

  custom_error_response {
    error_code            = "403"
    error_caching_min_ttl = "300"
    response_code         = "404"
    response_page_path    = var.inaccessible_page_path
  }

  custom_error_response {
    error_code            = "404"
    error_caching_min_ttl = "300"
    response_code         = "404"
    response_page_path    = var.inaccessible_page_path
  }
}

// Set up a policy to grant public access to bucket objects, including to CF.
// Consider making the underlying bucket private and using something like this:
// https://abridge2devnull.com/posts/2018/01/restricting-access-to-a-cloudfront-s3-website-origin/

resource "aws_s3_bucket_policy" "root" {
  bucket = aws_s3_bucket.root.id
  policy = data.aws_iam_policy_document.root.json
}

data "aws_iam_policy_document" "root" {
  policy_id = "RootPolicy"

  statement {
    sid       = "GrantCdnReadAccess"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.root.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

// Set up the subdomain DNS record.

resource "aws_route53_record" "root" {
  name    = "${local.domain_name}."
  type    = "A"
  zone_id = var.zone_id

  alias {
    name                   = aws_cloudfront_distribution.root.domain_name
    zone_id                = aws_cloudfront_distribution.root.hosted_zone_id
    evaluate_target_health = true
  }
}

// Set up a health check for the subdomain as well as a CloudWatch alarm.

resource "aws_route53_health_check" "root" {
  type              = "HTTPS"
  fqdn              = aws_route53_record.root.fqdn
  port              = 443
  measure_latency   = true
  request_interval  = 30
  failure_threshold = 2
  enable_sni        = true

  tags = {
    Name = "Health check for ${aws_route53_record.root.name}"
  }
}

resource "aws_s3_bucket_object" "shortcut" {
  for_each         = var.shortcuts
  bucket           = aws_s3_bucket.root.id
  key              = each.key
  website_redirect = each.value
}
