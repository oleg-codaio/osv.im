osv.im
======

[![Build Status](https://cloud.drone.io/api/badges/vaskevich/osv.im/status.svg)](https://cloud.drone.io/vaskevich/osv.im)

This repo contains the source of [osv.im](https://osv.im). It's split into a
number of subdirectories:

- `root/`: Current root site (osv.im), written in [Vue](https://vuejs.org/) and
   [TypeScript](https://www.typescriptlang.org/)
- `infra/`: Declarative infrastructure for the whole site, written in
  [Terraform](https://www.terraform.io/)
- `root-old/`: Original website (2014-2018), based on
  [Nanoc](https://nanoc.ws/), a static site generator written in Ruby.