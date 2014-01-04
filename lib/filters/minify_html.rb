require 'htmlcompressor'
require 'yuicompressor'

class MinifyHTMLFilter < Nanoc::Filter
  identifier :minify_html
  type :text

  def run(content, params={})
    js_compressor = Closure::Compiler.new(params.merge(:compilation_level => 'ADVANCED_OPTIMIZATIONS'))
    options = {
      :enabled => true,
      :remove_multi_spaces => true,
      :remove_comments => true,
      :remove_intertag_spaces => false,
      :remove_quotes => false,
      :compress_css => true,
      :compress_javascript => true,
      :simple_doctype => false,
      :remove_script_attributes => false,
      :remove_style_attributes => false,
      :remove_link_attributes => false,
      :remove_form_attributes => false,
      :remove_input_attributes => false,
      :remove_javascript_protocol => false,
      :remove_http_protocol => false,
      :remove_https_protocol => false,
      :preserve_line_breaks => false,
      :simple_boolean_attributes => false,
      :javascript_compressor => js_compressor,
    }
    compressor = HtmlCompressor::Compressor.new(params.merge(options))
    compressor.compress(content)
  end
end
