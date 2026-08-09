# jmlp 集合语言过滤(2026-08)
#
# jekyll-multiple-languages-plugin 只按语言过滤 pages/posts,
# 不处理 collections(_news/_projects/_books/_teachings 等)。
# 导致各语言站渲染全部 4 语文档,同 slug 文档输出到同一 URL 互相覆盖。
# 在每次 read 后按当前语言剔除 languages 不匹配的文档。
Jekyll::Hooks.register :site, :post_read do |site|
  site.collections.each_value do |collection|
    collection.docs.keep_if do |doc|
      langs = doc.data["languages"]
      langs.nil? || langs.include?(site.config["lang"])
    end
  end
end
