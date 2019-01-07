# TODO(oleg): use these.

def visits_counter
  '<noscript id="visits_counter">
    <a href="http://www.tracemyip.org/" target="_blank">
      <img src="http://www.tracemyip.org/tracker/1320/4684NR-IPIB/324472731/18/12/ans/" alt="Visitor Counter" border="0">
    </a>
  </noscript>'
end

def visits_counter_js_initializer
  # Postpone downloading the counter until the page downloads, so that the site loads faster.
  '$(function() {
    var code = "<script type=\"text/javascript\" src=\"http://www.tracemyip.org/tracker/lgUrl.php?stlVar2=1320&amp;rgtype=4684NR-IPIB&amp;pidnVar2=324472731&amp;prtVar2=18&amp;scvVar2=12\" />";
    $("#visits_counter").before(code);
  });'
end
