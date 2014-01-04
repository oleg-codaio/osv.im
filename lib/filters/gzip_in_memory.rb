require 'nanoc'

# Pretty much a duplicate of the built-in Gzip filter, but doesn't rely on a local, original file
class GzipInMemory < Nanoc::Filter
  VERSION = '0.0.1'
  identifier :gzip_in_memory

  type :text => :binary

  def run(content, params = {})
    Zlib::GzipWriter.open(output_filename, Zlib::BEST_COMPRESSION) do |gz|
      gz.orig_name = File.basename(output_filename)
      gz.mtime = mtime.to_i
      gz.write content
    end
  end

  def mtime
    # since we don't have a local file, use the current time
    Time.now
  end

end

