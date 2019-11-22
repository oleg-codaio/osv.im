/**
 * Terraform configuration for osv.im.
 */

provider "aws" {
  region  = var.region
  version = "~> 2.7"
  profile = var.aws_vault_profile

  assume_role {
    role_arn = var.aws_terraform_role_arn
  }
}

provider "aws" {
  alias   = "us-east-1"
  region  = "us-east-1"
  version = "~> 2.7"
  profile = var.aws_vault_profile

  assume_role {
    role_arn = var.aws_terraform_role_arn
  }
}

// Create a root SSL cert for the whole site.

resource "aws_acm_certificate" "root" {
  // Must be created in us-east-1.
  provider                  = aws.us-east-1
  domain_name               = "osv.im"
  validation_method         = "EMAIL"
  subject_alternative_names = ["*.osv.im"]
}

// Set up S3-backed CloudFront CDN distributions.

module "root_cdn_storage" {
  source              = "./modules/cdn-storage"
  name                = "root"
  zone_id             = aws_route53_zone.root.zone_id
  acm_ssl_cert_arn    = aws_acm_certificate.root.arn
}

module "legal_cdn_storage" {
  source                 = "./modules/cdn-storage"
  name                   = "legal"
  zone_id                = aws_route53_zone.root.zone_id
  acm_ssl_cert_arn       = aws_acm_certificate.root.arn
  inaccessible_page_path = "/index.html"
}

module "globetheater_cdn_storage" {
  source              = "./modules/cdn-storage"
  name                = "globetheater"
  zone_id             = aws_route53_zone.root.zone_id
  acm_ssl_cert_arn    = aws_acm_certificate.root.arn
}

// Set up an SNS topic for health check alerts.

// TF doesn't support email SNS topics because no ARN is created until the email is verified.
// Instead, we have to create a sub-stack using CF and expose its ARN.
// Based on https://github.com/deanwilson/tf_sns_email
resource "aws_cloudformation_stack" "alerts_sns_topic" {
  name          = "sns-alert-stack"
  provider      = aws.us-east-1
  template_body = file("${path.module}/sns.yml")

  parameters = {
    EmailAddress = var.sns_alert_email
  }
}

