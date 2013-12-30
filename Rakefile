LOCAL_PORT = 3800

AWS_BUCKET = "www.olegvaskevich.com"
# Set AWS access credentials here
ENV['AWS_ACCESS_KEY_ID'] = ""
ENV['AWS_SECRET_ACCESS_KEY'] = ""
ENV['S3SYNC_MIME_TYPES_FILE'] = "#{File.dirname(__FILE__)}/mime.types"

desc "Build the website"
task :build do
  puts "## Building..."
  status = system("nanoc prune --yes && nanoc compile")
  puts status ? "OK" : "FAILED"
end

desc "Deploy to S3"
task :deploy do
  if ENV['AWS_ACCESS_KEY_ID'].empty? || ENV['AWS_SECRET_ACCESS_KEY'].empty?
    throw "Please configure AWS access tokens in Rakefile."
  end
  puts "## Deploying to S3"

  # first upload all the files except the scripts, styles and images
  # then upload allfiles but add an expires header - this way, it will only apply to the files we haven't uploaded
  sh "bundle exec 's3sync --recursive --verbose --gzip=\"html,htm,txt\" --exclude \".?(styles-\\w+\\.css|scripts-\\w+\\.js|images/.*)\" output/ #{AWS_BUCKET}:'"
  sh "bundle exec 's3sync --recursive --verbose --gzip=\"css,js\" --cache-control=\"max-age=31536000\" --delete output/ #{AWS_BUCKET}:'"
end

desc "Build and deploy to S3"
task :buildAndDeploy => [:build, :deploy]

desc "Run a test development server on localhost:#{LOCAL_PORT}"
task :runTestServer do
  puts "## Starting nanoc to run locally"
  status = system("nanoc view")
  puts status ? "OK" : "FAILED"
end
