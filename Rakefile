require 'digest/md5'
require 'mechanize'

LOCAL_PORT = 3800

AWS_BUCKET = "www.olegvaskevich.com"
AWS_BUCKET_STAGING = "staging-1.olegvaskevich.com"

# Set AWS access credentials here
ENV['AWS_ACCESS_KEY_ID'] = ""
ENV['AWS_SECRET_ACCESS_KEY'] = ""
ENV['S3SYNC_MIME_TYPES_FILE'] = "#{File.dirname(__FILE__)}/mime.types"

GRAVATAR_EMAIL = "me@olegvaskevich.com"
GRAVATAR_PICTURE_SIZE = 120

desc "Build the website"
task :build do
  if !File.file?("content/images/gravatar.jpg") || !File.file?("content/images/gravatar_retina.jpg")
    Rake::Task[:updateGravatarPictures].invoke
  end
  puts "## Building..."
  system("nanoc prune --yes && nanoc compile") or raise "FAILED"
  puts "OK"
end

desc "Deploy to S3"
task :deploy, :destination do |t, args|
  if ENV['AWS_ACCESS_KEY_ID'].empty? || ENV['AWS_SECRET_ACCESS_KEY'].empty?
    raise "Please configure AWS access tokens in Rakefile."
  end

  destination = args[:destination]

  if destination == 'staging' || destination.nil?
    bucket = AWS_BUCKET_STAGING
  elsif destination == 'production'
    bucket = AWS_BUCKET
  else
    raise "Unknown destination '" + destination + "'."
  end

  puts "## Deploying to S3"

  # first upload the favicon and all the files except the scripts, styles and images
  # then upload allfiles but add an expires header - this way, it will only apply to the files we haven't uploaded
  sh "bundle exec 's3sync --recursive --verbose --gzip=\"html,htm,txt\" --exclude \".?(styles-\\w+\\.css|scripts-\\w+\\.js|favicon.ico|images/.*)\" output/ #{bucket}:'"
  sh "bundle exec 's3sync --recursive --verbose --gzip=\"css,js\" --cache-control=\"max-age=31536000\" --delete output/ #{bucket}:'"
end

desc "Build and deploy to S3"
task :buildAndDeploy, :destination do |t, args|
  Rake::Task[:build].invoke
  Rake::Task[:deploy].invoke(args.try(:destination))
end

desc "Run a test development server on localhost:#{LOCAL_PORT}"
task :runTestServer do
  puts "## Starting nanoc to run locally"
  status = system("nanoc view")
  puts status ? "OK" : "FAILED"
end

task :updateGravatarPictures do
  puts "Downloading pictures from Gravatar..."

  hash = Digest::MD5.hexdigest(GRAVATAR_EMAIL.strip.downcase)
  size = GRAVATAR_PICTURE_SIZE
  link = "http://www.gravatar.com/avatar/#{hash}?s=#{size}"
  link_retina = "http://www.gravatar.com/avatar/#{hash}?s=#{size*2}"
  agent = Mechanize.new
  agent.get(link).save!("content/images/gravatar.jpg") or raise "Error downloading"
  agent.get(link_retina).save!("content/images/gravatar_retina.jpg") or raise "Error downloading"

  puts "OK"
end
