require 'closure-compiler'

class CompressJsClosureFilter < Nanoc::Filter
  identifier :compress_js_closure
  type :text

  def run(content, params={})
    closure = Closure::Compiler.new(params.merge({
      :compilation_level => 'SIMPLE_OPTIMIZATIONS',
      :externs => closure_externs.map{|s| File.absolute_path(s.raw_filename)}
      }))
    closure.compress(content)
  end
end
