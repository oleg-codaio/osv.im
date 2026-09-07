/**
 * Instantiates an S3-based CloudFront distribution on a given subdomain.
 */

locals {
  s3_origin_id = "S3-${var.name}"
  domain_name  = "${var.name != "root" ? "${var.name}." : ""}osv.im"
  aliases      = concat([local.domain_name], var.extra_aliases)
}

resource "aws_cloudfront_function" "www_redirect" {
  count   = var.redirect_www || var.normalize_html_routes ? 1 : 0
  name    = "${var.name}-www-redirect"
  runtime = "cloudfront-js-2.0"
  comment = "Normalize requests for ${local.domain_name}"
  publish = true
  code    = <<-EOT
    function handler(event) {
        var request = event.request;
        var host = request.headers.host.value;
        var canonicalHost = host;
        var canonicalUri = request.uri;
        var exclusions = ${jsonencode(var.html_route_exclusions)};
        var queryParts = [];

        Object.keys(request.querystring).forEach(function (key) {
            var parameter = request.querystring[key];
            var values = parameter.multiValue || [parameter];
            values.forEach(function (value) {
                queryParts.push(key + '=' + value.value);
            });
        });

        if (${var.redirect_www} && host.indexOf('www.') === 0) {
            canonicalHost = '${local.domain_name}';
        }

        if (${var.normalize_html_routes}) {
            if (canonicalUri === '/index.html') {
                canonicalUri = '/';
            } else if (canonicalUri.endsWith('/index.html')) {
                canonicalUri = canonicalUri.slice(0, -11);
            } else if (canonicalUri.length > 1 && canonicalUri.endsWith('/')) {
                canonicalUri = canonicalUri.slice(0, -1);
            }
        }

        if (canonicalHost !== host || canonicalUri !== request.uri) {
            return {
                statusCode: 301,
                statusDescription: 'Moved Permanently',
                headers: {
                    'location': {
                        value: 'https://' + canonicalHost + canonicalUri +
                            (queryParts.length ? '?' + queryParts.join('&') : '')
                    }
                }
            };
        }

        if (
            ${var.normalize_html_routes} &&
            request.uri !== '/' &&
            exclusions.indexOf(request.uri) === -1 &&
            request.uri.substring(request.uri.lastIndexOf('/') + 1).indexOf('.') === -1
        ) {
            request.uri += '/index.html';
        }

        return request;
    }
  EOT
}

// Create an S3 bucket to hold these assets.
// Have it be public so that the CDN can access the website endpoint to enable
// S3 static hosting features like redirects to work.

resource "aws_s3_bucket" "root" {
  bucket = "${var.bucket_prefix}-${var.name}-assets"

  tags = {
    Name = "Static assets for ${var.name}"
  }
}

resource "aws_s3_bucket_ownership_controls" "root" {
  bucket = aws_s3_bucket.root.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "root" {
  depends_on = [aws_s3_bucket_ownership_controls.root]

  bucket = aws_s3_bucket.root.id
  acl    = "private"
}

resource "aws_s3_bucket_versioning" "root" {
  bucket = aws_s3_bucket.root.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_website_configuration" "root" {
  bucket = aws_s3_bucket.root.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

// Set up an SSL-enabled CloudFront distribution.

resource "aws_cloudfront_distribution" "root" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.root.website_endpoint
    origin_id   = local.s3_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  comment             = var.name
  aliases             = local.aliases
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

    dynamic "function_association" {
      for_each = var.redirect_www || var.normalize_html_routes ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
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

resource "aws_s3_object" "shortcut" {
  for_each         = var.shortcuts
  bucket           = aws_s3_bucket.root.id
  key              = each.key
  website_redirect = each.value
}
