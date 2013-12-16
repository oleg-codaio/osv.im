LOCAL_PORT = 3800

AWS_BUCKET = "www.olegvaskevich.com"
# Set AWS access credentials here
ENV['AWS_ACCESS_KEY_ID'] = ""
ENV['AWS_SECRET_ACCESS_KEY'] = ""

desc "Build the website"
task :build do
  puts "## Building..."
  status = system("nanoc compile")
  puts status ? "OK" : "FAILED"
end

desc "Deploy to S3"
task :deploy do
  if ENV['AWS_ACCESS_KEY_ID'].empty? || ENV['AWS_SECRET_ACCESS_KEY'].empty?
    throw "Please configure AWS access tokens in Rakefile."
  end
  puts "## Deploying to S3..."
  sh "s3sync -r -v --delete /output #{AWS_BUCKET}:/"
end

desc "Build and deploy to S3"
task :buildAndDeploy => [:build, :deploy]

desc "Run a test development server on localhost:#{LOCAL_PORT}"
task :runTestServer do
  puts "## Starting nanoc to run locally "
  status = system("nanoc view")
  puts status ? "OK" : "FAILED"
end
