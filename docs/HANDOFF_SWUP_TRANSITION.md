# 交接说明：Swup 页面切换动画（供 GLM 验证）

> 本文档由 Claude Code 编写，交接给 GLM 完成 **构建与浏览器验证**。
> 需求：上导航栏与下版权栏**常驻不动**，中间内容区切换时带过渡动画；用成熟库实现，不自造。
> 实现日期：2026-08-08。替代方案：此前的跨页 View Transitions 实验已移除（`_backup_demo/page-transition.scss.removed` 存档）。

## 一、方案

**[Swup](https://swup.js.org/) 4.9.2**（官方 UMD，本地化自托管）+ 两个官方插件：

| 组件                       | 版本  | 作用                                                                      |
| -------------------------- | ----- | ------------------------------------------------------------------------- |
| `Swup.umd.js`              | 4.9.2 | 核心：拦截链接、fetch 新页、只替换 `#swup` 容器、管理历史/前进后退        |
| `SwupHeadPlugin.umd.js`    | 2.3.1 | 交换 `<head>`：更新 `<title>` 与页面级 meta（`persistAssets` 防重复加载） |
| `SwupScriptsPlugin.umd.js` | 2.1.0 | 交换后重放容器内页面级脚本                                                |

动画是 swup 官方文档的标准用法：swup 切换时给 `<html>` 加 `is-animating` 类，`_sass/_swup.scss` 里 `.swup-transition-main` 定义 0.32s 淡出淡入，只作用 `#swup` 容器——**导航栏与页脚在容器外，结构上不可能被动到**。

## 二、改动清单

| 文件                                             | 操作                                                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/js/vendor/swup/Swup.umd.js`              | 新增（下载自 unpkg，官方包）                                                                                                                    |
| `assets/js/vendor/swup/SwupHeadPlugin.umd.js`    | 新增（同上）                                                                                                                                    |
| `assets/js/vendor/swup/SwupScriptsPlugin.umd.js` | 新增（同上）                                                                                                                                    |
| `assets/js/swup-init.js`                         | 新增：初始化 + DOMContentLoaded 垫片 + tooltips/popover/bibsearch 重初始化钩子                                                                  |
| `_sass/_swup.scss`                               | 新增：0.32s 淡出淡入动画（含 prefers-reduced-motion 降级）                                                                                      |
| `assets/css/main.scss`                           | 末尾追加 `@use "swup";`                                                                                                                         |
| `_layouts/default.liquid`                        | 新增（遮蔽 gem）：内容容器加 `id="swup"` + `swup-transition-main`，容器尾部 include `scripts_page.liquid`                                       |
| `_includes/scripts_page.liquid`                  | 新增：页面级脚本（masonry 初始化、al_charts、calendar、al_math、typograms、表格、common/copy_code/jupyter_new_tab、badges、al_img_tools、tabs） |
| `_includes/scripts.liquid`                       | 重写：只留全局/持久区脚本 + 库文件（masonry/imagesLoaded/tocbot 改全局常驻，**不用 defer**）+ swup 三库 + swup-init                             |
| `_includes/news.liquid`                          | 顺手修复英文回退（日期恢复 `%Y年%-m月%-d日`、"暂无新闻。"）                                                                                     |

**关键设计（排障时要知道的）**：

1. **库与初始化分离**。`SwupScriptsPlugin` 重放脚本是动态插入，执行顺序不保证。所以凡是"只定义全局对象"的库（masonry/imagesLoaded/tocbot 库本体、tooltips-setup 的 `window.AlFolioUi`）全部移到 `scripts.liquid` 全局常驻、且**不加 defer**（解析期先执行）；容器内只剩初始化脚本，重放无竞态。
2. **DOMContentLoaded 垫片**（`swup-init.js` 内）：gem 页面级 JS 都包在 `DOMContentLoaded` 监听里，重放时事件早已触发完毕。垫片让"文档加载完成后才注册的监听"立即执行。首次加载（`readyState === "loading"`）走原生路径，持久区脚本不受影响。
3. **bibsearch.js 是 `type="module"`**：浏览器按 URL 对模块去重，重插同 URL 标签不重跑。`swup-init.js` 在 `content:replace` 钩子里检测 `#bibsearch`，带唯一查询串 `import()` 强制重新求值。
4. 降级：三个库任一加载失败，`swup-init.js` 静默返回，整站回退为普通整页跳转，无 JS 报错。

## 三、验证步骤（Docker）

```bash
cd /e/wcs/al-folio-main
docker compose up -d
docker compose logs --tail=80        # 无 Sass Error / Liquid Exception
curl -fsS http://127.0.0.1:8080/al-folio/ >/dev/null
```

浏览器打开 `http://127.0.0.1:8080/al-folio/`，F12 开 Console，逐项核对：

1. **核心效果**：点导航栏各页——上导航栏与下版权栏**完全不动**（不闪、不重建、深色模式按钮状态保持），仅中间内容区 0.3s 淡出→淡入。浏览器前进/后退同样带动画。
2. **Console 无红字**（重点：`Swup`、`bibsearch`、`tocbot`、`MathJax` 相关报错）。
3. **页面标题**随切换更新（HeadPlugin 生效），检查标签页标题文字。
4. **学术成果页**：从别的页 swup 切换进入，筛选框输入"PNAS"能正常过滤（bibsearch 重初始化生效）；摘要/BibTeX 折叠按钮可展开（common.js 重放生效）；再切走再切回，仍然正常。
5. **学术简历页**（左侧 TOC）：swup 切换进入，目录生成且点击锚点平滑滚动（tocbot 重初始化生效）。
6. **首页**：照片墙、新闻表格正常；移动端 375px 汉堡菜单展开/收起正常（nav-toggle 是持久区脚本，不应受任何影响）。
7. **深色模式**：切换深色后再翻页，主题保持、无白闪。
8. **搜索**：navbar 搜索框打开、搜关键词、点结果——正常跳转；若搜索浮层在跳转后未自动关闭，记下来反馈（al_search gem 行为，需单独处理）。
9. 快速连续点击不同导航项——动画平滑衔接，无卡死、无内容区消失（swup 会中断当前切换重新开始，这是正常行为）。
10. 直接刷新任意内页（非首页进入）——首屏正常，再点导航动画正常。

通过后 `docker compose down`。

## 四、已知限制（非 bug，暂不需处理）

- **统计分析**：`al_analytics` 全局脚本只在首次加载计一次 pageview，swup 后续切换不计（SPA 通病）。本站访问量小，可忽略。
- **tocbot 实例**：从有 TOC 的页切到无 TOC 的页，旧实例的滚动监听指向已分离 DOM，无报错但有微小内存驻留；量级可忽略。
- **al_charts/al_math 页**：若未来发布含图表/公式的博文，swup 切换进入后需重点验证渲染（MathJax 与图表库重放路径未实测）。

## 五、回滚

1. `_layouts/default.liquid`：删 `id="swup"`、`swup-transition-main` 类与 `{% include scripts_page.liquid %}` 行（或整文件删除回退 gem 版，但会丢失本次脚本拆分）。
2. `assets/css/main.scss`：删 `@use "swup";`，删 `_sass/_swup.scss`。
3. `_includes/scripts.liquid` 末尾删 4 个 swup `<script>` 标签。
4. 页面级脚本拆分（`scripts_page.liquid`）与库全局化**对普通整页跳转同样正确**，无需回退。
5. 删除 `assets/js/vendor/swup/` 与 `assets/js/swup-init.js`。

回滚后整站恢复为无动画的普通跳转。

---

## 六、2026-08-08 白屏修复记录（重要）

交接后发现"点导航直接全白"，根因与修复如下。**核心教训：`SwupScriptsPlugin` 默认 `head:true, body:true`，重放范围是整个 document，不是 `#swup` 容器**。已在 `swup-init.js` 中修复并加了三道防线：

1. **`new SwupScriptsPlugin({ head: false })`**：head 归 HeadPlugin 管。若不设此项，开发环境 jekyll serve 在响应 head 注入的内联 `document.write(...livereload...)` 脚本会被重放——`document.write` 在已加载文档上等于 `document.open()`，**直接清空整个文档**（此前白屏的直接元凶；生产无 livereload 但保底无妨）。
2. **`swup-init.js` 的 `before("content:replace")` 钩子**：替换前把当前文档中 `#swup` 容器外的脚本全部打上 `data-swup-ignore-script`。gem include 输出的持久脚本（al_search 的 `search-setup.js`、cookie、analytics、instantpage 等）无法在 include 里打标，二次执行会顶层 `let/const` 重复声明报错——统一由钩子拦截。
3. **MathJax 只加载一次**：同一钩子给新页文档（`visit.to.document`）里的 `#MathJax-script` / `mathjax-setup.js` 打标跳过重放（二次初始化抛 `Cannot set property Package`）；切换后由 `content:replace` 钩子调 `MathJax.typesetPromise()` 渲染新公式。

另外两处配套改动：

- `_includes/scripts.liquid`：所有持久区脚本手工加 `data-swup-ignore-script`（nav-toggle、bootstrap-compat、masonry/imagesloaded/tocbot CDN、tooltips-setup、no_defer、back-to-top、swup 三库、swup-init.js），并新增注释说明。首次加载行为完全不变。
- `swup-init.js` 开头 `window.__swupInitDone` 防重复标志：即使脚本被意外重放也绝不二次实例化 Swup（双实例会互相竞争 `is-animating` 类导致内容区永久 `opacity:0` 白屏）。

**验证结果（Playwright 无头浏览器，`http://127.0.0.1:8080/wang-chengshan-site/`）**：连续切换 news/publications/projects/blog/teaching/cv、往返、浏览器前进后退、快速连点——内容区正常切换、`html` 无 `is-animating` 残留、opacity 恒为 1、**Console 零报错**。

**8. 首页照片墙常驻（2026-08-08 追加）**：

原照片墙 include 在 `_layouts/about.liquid`（`#swup` 容器内）——每次切回首页整个照片墙重建：32 张图重新解码、160s 滚动动画从头重启，表现为"背景图片墙 + 中间文字抽动"。已改为**全站常驻**：

- `_includes/photo-wall.html`：改为无包裹输出，`img` 去掉 `loading="lazy"`（常驻即预加载，无论先打开哪页，32 张图都立即加载好）
- `_layouts/default.liquid`：照片墙 include 移到 `#swup` 容器外（header 之后），切换页面永不重建
- `_layouts/about.liquid`：删除原 include
- `_sass/_photo-wall.scss`：`.photo-wall` 默认 `visibility: hidden`，`body.photo-wall-active` 时 `visible`——visibility 切换不中断滚动动画，切回首页照片墙直接是完整状态，零抽动
- `assets/js/swup-init.js`：`updatePhotoWall()` 按 URL 切换 body 类（pathname 只剩 baseurl 一段 = 首页），初始化与每次 `content:replace` 后调用。**注意：初始化调用必须放在 IIFE 末尾**（所有 `const` 定义之后），否则 TDZ 报错导致后续钩子全部失效

验证：首页→news→首页循环，`.photo-wall-track` transform 位移持续前进（-63→-151→-220，从未重置），非首页时 DOM 常驻且 32 图全部已加载。

**9. 整页左右抽动（2026-08-08 追加修复）**：

经典滚动条（Windows）占 ~15px。页面间内容高度不同 → 滚动条出现/消失 → 可用宽度变化 → **整个居中布局（导航栏/内容区/版权栏）随切换左右平移**，表现为"点击导航后整页抽动"。已新增 `_sass/_scrollbar-stability.scss`（`assets/css/main.scss` 引用）：`html { overflow-y: scroll; scrollbar-gutter: stable; }` 滚动条槽常驻，页面宽度恒定。实测（headful，1920×1080）：所有页面 `clientW` 恒为 1905、导航栏/页脚 x 坐标恒定，切换期间唯一状态 `1905|487.4|0`，零位移。注：`scrollbar-gutter: stable` 单独对根视口在 Chrome 下实测不生效，故以 `overflow-y: scroll` 兜底。

**10. 横向滚动条清零（2026-08-08 追加）**：

要求"新闻动态等页面不要横向滚动条"，逐页实测找出全部溢出源并修复（`_sass/_scrollbar-stability.scss` 汇总）：

- **新闻表格**：`.memorial-timeline` 加 `table-layout: fixed` + `width: calc(100% - 0.35rem)`（缩进与宽度抵消，不再右缘超 6px）；`th` 不换行、`td` 断行
- **论文列表**：Bootstrap `.row` 负 margin(±15px) 在无 padding 的 `li` 里右缘超 15px → `.bibliography li` 补 15px 左右 padding（视觉不变）
- **cv 时间线**：`.cv .list-group-item` 补 `padding-right: 15px`（同 row 负 margin 问题）
- **BibTeX 代码块**：`pre` 长行不换行（实测 1087px）→ `.bibtex figure.highlight pre` 加 `pre-wrap`/`word-break`。注意 specificity：pygments 主题 CSS 在 main.css 之后加载，`.highlight pre`(0,1,1) 会覆盖 `.bibtex pre`(0,1,1)，必须用 (0,2,1)
- **兜底**：`html { overflow-x: hidden }` 页面级横向滚动条永不出现

验证（1280×900 headful 全页扫描）：首页/news/publications/projects/blog/teaching/cv/课程页全部 `hScroll:false`，`#swup` 内无任何滚动容器溢出（cv 的 `.date-column` 有 `transform: translateX(-15px)` 属布局测量 5px，视觉已移入容器内，无滚动条）。

**11. 深色模式表格文字色修复（2026-08-08 追加）**：

Bootstrap `.table` 硬编码文字色 `#212529`（近黑），`.table-cv`（cv 联系信息）与 `.memorial-timeline`（新闻时间轴）只覆盖了背景没覆盖文字色 → **深色模式下这些表格文字仍是黑色**。已在 `_sass/_memorial.scss` 补 `color: var(--global-text-color)`（含 td）。实测（dark 强制 + swup 切换路径）：cv 联系信息、首页/新闻页时间轴表格全部 `rgb(232,232,232)`，全站扫描无 `#212529` 残留。

**7. 开发环境 livereload 与 swup 冲突（2026-08-08 追加修复）**：

`bin/entry_point.sh` 原以 `jekyll serve --livereload` 启动。Windows 宿主机 + Docker bind mount 下 `--force_polling` 会**频繁误判文件变化**（日志可见反复 `LiveReload: Reloading URL ...`），每次 rebuild 后 livereload 向浏览器广播整页 reload——点击导航时恰好撞上广播，页面被整页刷新打断（Network 面板可见大量 `net::ERR_ABORTED`，发起者为 `livereload.js reloadPage`），表现为"点击偶尔出错/页面跳回首页"。**已从启动命令移除 `--livereload`**（保留 `--watch`：文件变化仍重建，swup fetch 拿到新内容，SPA 体验稳定）。该问题仅存在于本地 docker 开发环境，生产部署（GitHub Pages）无此环节。
