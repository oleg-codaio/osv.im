# osv.im

[![CI/CD Pipeline](https://github.com/oleg-codaio/osv.im/actions/workflows/deploy.yml/badge.svg)](https://github.com/oleg-codaio/osv.im/actions/workflows/deploy.yml)

This repo contains the source of [osv.im](https://osv.im). It's split into a
number of subdirectories:

- `root/`: Current root site (osv.im), written in [Vue](https://vuejs.org/) and
  [TypeScript](https://www.typescriptlang.org/)
- `infra/`: Declarative infrastructure for the whole site, written in
  [Terraform](https://www.terraform.io/)
- `root-old/`: Original website (2014-2018), based on
  [Nanoc](https://nanoc.ws/), a static site generator written in Ruby.
