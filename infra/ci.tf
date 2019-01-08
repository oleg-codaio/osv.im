/**
 * Continuous integration configuration for osv.im. Uses CircleCI.
 */

resource "aws_iam_user" "drone_ci" {
  name = "DroneCI"
}

locals {
  ci_write_buckets = [
    "${module.root_cdn_storage.bucket_arn}",
    "${module.legal_cdn_storage.bucket_arn}",
    "${module.globetheater_cdn_storage.bucket_arn}",
  ]

  ci_write_cdns = [
    "${module.root_cdn_storage.cloudfront_arn}",
    "${module.legal_cdn_storage.cloudfront_arn}",
    "${module.globetheater_cdn_storage.cloudfront_arn}",
  ]
}

resource "aws_iam_policy" "ci_bucket_write_policy" {
  name        = "GrantCIPublishAccess"
  description = "Grant CI access to publish to S3 buckets"
  policy      = "${data.aws_iam_policy_document.ci_s3_policy.json}"
}

data "aws_iam_policy_document" "ci_s3_policy" {
  policy_id = "GrantCIPublishAccessPolicy"

  statement {
    sid = "AllowWrite"

    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]

    resources = ["${concat(local.ci_write_buckets, formatlist("%s/*", local.ci_write_buckets))}"]
  }

  statement = {
    sid = "AllowInvalidateCdn"

    actions = ["cloudfront:CreateInvalidation"]

    resources = ["${local.ci_write_cdns}"]
  }
}

resource "aws_iam_user_policy_attachment" "ci_bucket_write_policy_attachment" {
  user       = "${aws_iam_user.drone_ci.name}"
  policy_arn = "${aws_iam_policy.ci_bucket_write_policy.arn}"
}

resource "aws_iam_access_key" "ci-user-access-key-v1" {
  user    = "${aws_iam_user.drone_ci.name}"
  pgp_key = "${var.pgp_key}"
}
