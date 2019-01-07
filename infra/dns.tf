/**
 * Global DNS configuration for osv.im.
 */

resource "aws_route53_zone" "root" {
  name = "osv.im."
}

// MX and SPF records for sending mail via Pobox.

resource "aws_route53_record" "root_mx" {
  name   = "osv.im."
  type    = "MX"
  zone_id = "${aws_route53_zone.root.zone_id}"
  ttl     = "300"

  records = [
    "10 mx-2.rightbox.com",
    "10 mx-1.rightbox.com",
    "10 mx-3.rightbox.com",
  ]
}

resource "aws_route53_record" "root_spf" {
  name    = "osv.im."
  type    = "SPF"
  zone_id = "${aws_route53_zone.root.zone_id}"
  ttl     = "300"
  records = ["v=spf1 include:pobox.com ?all"]
}

resource "aws_route53_record" "root_txt" {
  name    = "osv.im."
  type    = "TXT"
  zone_id = "${aws_route53_zone.root.zone_id}"
  ttl     = "300"

  records = [
    "v=spf1 include:pobox.com ?all",
    "keybase-site-verification=WpdG73nB_cS7PvZ5RkYYcaPerhAQ53w-gI5wZECg_Ek",
  ]
}

// Set up a redirect from www to the naked domain.

resource "aws_route53_record" "www_cname" {
  name    = "www.osv.im."
  type    = "CNAME"
  zone_id = "${aws_route53_zone.root.zone_id}"
  ttl     = "600"
  records = ["osv.im"]
}
