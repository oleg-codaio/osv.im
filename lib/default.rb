require 'digest/md5'

GRAVATAR_EMAIL = "me@olegvaskevich.com"
GRAVATAR_PICTURE_SIZE = 120

# finds the MD5 digest of several items so we can keep track
# when they're changed
def digest_for(items)
  digest = Digest::MD5.new
  items.each{|x| digest << x.raw_content}
  digest.hexdigest
end

def all_scripts_with_closure_externs
  @items.select{|i| i.identifier.start_with?("/script/")}.reject{|i| i.identifier.start_with?("/script/partials/")}
end

# returns all the scripts that need to be compiled into production, except the ones in the closure_externs folder
def all_scripts
  all_scripts_with_closure_externs.reject{|i| i.identifier.start_with?("/script/closure-externs/")}
end

def js_partial_by_name(name)
  @items.find{|i| i.identifier == "/script/partials/#{name}/"}.raw_content
end

def closure_externs
  @items.select{|i| i.identifier.start_with?("/script/closure-externs/")}
end

def all_styles
  @items.select{|i| i.identifier.start_with?("/style/")}
end

def all_scripts_combined_filename
  "/scripts-#{digest_for(all_scripts)}.js"
end

def all_styles_combined_filename
  "/styles-#{digest_for(all_styles)}.css"
end

def profile_image_size
  GRAVATAR_PICTURE_SIZE
end

def profile_image_url(retina = false)
  # note that retina.js automatically finds @2x
  filename = @items.find{|g| g.identifier == '/images/gravatar/'}.raw_filename
  hash = Digest::MD5.file(filename).hexdigest
  retina ? "/images/gravatar-#{hash}@2x.jpg" : "/images/gravatar-#{hash}.jpg"
end
