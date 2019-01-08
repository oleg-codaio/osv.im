variable "region" {
  description = "The AWS region to use, e.g., us-west-2"
}

variable "aws_vault_profile" {
  description = "The AWS credentials profile to use"
}

variable "aws_terraform_role_arn" {
  description = "The MFA-secured role to assume to plan and apply changes"
}

variable "sns_alert_email" {
  description = "The email address that will receive health alerts"
}

variable "pgp_key" {
  description = "The PGP key to use to encrypt secrets, either `keybase:<user> or the base64 PGP body`"
}
