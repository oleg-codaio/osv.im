olegvaskevich.com
=================

This website contains the source of olegvaskevich.com.

Building
--------
1. Install `ruby-1.9.3` and `rubygems`
1. Run `gem install bundler`
1. `cd` to the project directory and run `bundle install` to install dependencies
1. Install [`glue`](http://glue.readthedocs.org/en/latest/) (for sprites) and [`optipng`](http://optipng.sourceforge.net/)
1. Run `rake build` to compile and `rake deploy` to upload to S3 (you will need to add the AWS token and secret into `Rakefile` beforehand). You can also run `rake buildAndDeploy`

Development
-----------
* During development, it may be desirable to set the `PRODUCTION` boolean to false. This prevents running YUI Compressor/Closure Compiler and other processes that take a long time to run
* You can use `rake runTestServer` to access content locally on `localhost:3000`
