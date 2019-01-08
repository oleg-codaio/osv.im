infra
=====

The infrastructure for this site and its subdomains runs on AWS and is declared in Terraform.

Setup
-----

1. Credentials are managed using [`aws-vault`](https://github.com/99designs/aws-vault).
   If on macOS, install via `brew cask install aws-vault`
2. Create a new AWS account, and add a new IAM user with a `ReadOnlyAccess` canned policy.
3. Updated the trust relationship for the auto-created `AdministratorAccess` role to
   reference the new user, along with:

   ```json
   "Condition": {
     "Bool": {
       "aws:multifactorAuthPresent": "true"
     }
   }
   ```

4. Set up MFA on the created IAM user, and update `~/.aws/config` (or wherever) per the
   [aws-vault instructions](https://github.com/99designs/aws-vault#assuming-roles).


Infrastructure Setup
--------------------

Infra changes can be applied locally like this:

```sh
aws-vault exec osv_im_admin -- terraform apply
```

They aren't set up with CD because that makes things like rollbacks more difficult.


CI/CD Setup
-----------

Continuous integration and deployment is configured using [Drone](https://cloud.drone.io/) and defined in
`.drone.yml`. Drone secrets should be configured via the outputs from `terraform outputs`. The secret key
can be obtained using:

```bash
terraform output ci_user_access_key_encrypted_secret_curr | base64 --decode | keybase pgp decrypt
```

For security, the project should be marked as Protected and secrets should not be exposed to PR triggers.
