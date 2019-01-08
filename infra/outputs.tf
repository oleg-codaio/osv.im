# This file is set up for key rotation as described in https://cloud.gov/docs/ops/runbook/rotating-iam-users/.

output "ci_user_access_key_id_prev" {
  value = ""
}

output "ci_user_access_key_encrypted_secret_prev" {
  value = ""
}

output "ci_user_access_key_id_curr" {
  value = "${aws_iam_access_key.ci-user-access-key-v1.id}"
}

output "ci_user_access_key_encrypted_secret_curr" {
  value = "${aws_iam_access_key.ci-user-access-key-v1.encrypted_secret}"
}

output "legal_cloudfront_distribution_id" {
  value = "${module.legal_cdn_storage.cloudfront_id}"
}
