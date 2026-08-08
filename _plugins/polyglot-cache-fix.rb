# jekyll-multiple-languages-plugin 与 Jekyll 4.4 兼容修复(2026-08)
#
# 根因:Jekyll 4 的 relative_url/absolute_url filter 使用 site.filter_cache
# 缓存计算结果。jmlp 在同一 Site 实例内循环构建各语言,zh(默认)先填充缓存
# (baseurl=/wang-chengshan-site),en/ja/ko 构建时命中缓存,链接缺少语言前缀。
# 修复:每次页面渲染前清空 filter_cache,强制按当前语言 baseurl 重算。
Jekyll.logger.warn "polyglot-cache-fix loaded"
Jekyll::Hooks.register :site, :pre_render do |site|
  site.filter_cache.clear if site.respond_to?(:filter_cache)
end
