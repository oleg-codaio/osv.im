require 'digest/md5'

# finds the MD5 digest of several items so we can keep track
# when they're changed
def digest_for(items)
  digest = Digest::MD5.new
  items.each {|x| digest << x.raw_content}
  digest.hexdigest
end

def all_scripts
  @items.select{|i| i.identifier.start_with?("/script/")}
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
