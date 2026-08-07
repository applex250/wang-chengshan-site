# 前端美化执行手册：中文学术排版优化（供 GLM 执行）

> 本文档由 Claude Code 编写，交接给 GLM 完成**前端字体排版优化与验证**。
> 目标：解决站点"字体难看、排版难看、不协调"的问题，落地**宋体衬线标题 + 黑体正文**的中科院院士学术风。
> 编写日期：2026-08-07。前置文档：[`HANDOFF_ZH_SITE.md`](HANDOFF_ZH_SITE.md)（中文化与红色主题改造）。

## 一、诊断：为什么现在难看

根因**不在内容、不在主题色**，集中在字体排版系统（均已逐条核实自 gem `al_folio_core` 1.0.15 源码）：

1. **全站没有中文字体栈**。正文规则是 gem `assets/tailwind/app.css` 里的 `body { font-family: Roboto, sans-serif }`，Roboto 不含中文字形，中文只能落到各平台默认 sans，Windows 上是未指定优化的默认渲染，观感毛糙。
2. **字重 300**。`body { font-weight: 300 }`、`h1-h6 { font-weight: 300 }`。拉丁字母 300 纤细优雅，但**中文笔画在 300 下发虚、锯齿感重**——这是"难看"的最大单一来源。
3. **行高 1.5**。中文是方块字，1.5 行高拥挤，需要 1.75–1.9 才舒展。
4. **标题无衬线**。学术机构官网的庄重感来自宋体/衬线标题；全 sans 显得"网页模板味"。
5. 其余英文残留此前已修复（`about.liquid` 的"新闻动态/代表性成果"、新闻与博文的 `%Y年%-m月%-d日` 日期格式等），本手册不涉及。

## 二、覆盖机制（为什么这样做有效）

- gem 的 `_includes/head.liquid` 先加载 `tailwind.css`（约第 18 行），后加载 `main.css`（约第 122 行）。
- tailwind 的 body/标题字体规则写在 `@layer base` 里。CSS 层叠规则：**无层（unlayered）样式优先级永远高于任何 @layer 内样式**。`main.css` 是无层样式，所以其中的同名规则必胜，与加载顺序无关、双保险。
- `main.css` 由 `assets/css/main.scss` 通过 `@use "typography"` 编译。Jekyll 的 Sass load path **本地优先于 gem**：在本仓库新建 `_sass/_typography.scss` 会**整体遮蔽** gem 同名文件。
- 因此覆盖文件必须**先逐字保留 gem 原文件全部内容**，再在末尾追加自定义规则（与已存在的 `_sass/_themes.scss` 覆盖是同一手法）。
- gem 原文参考（本机解包位置）：`C:\Users\wu\AppData\Local\Temp\_sass\_typography.scss`。若该临时目录已被清理，可用 `gem fetch al_folio_core -v 1.0.15` 重新解包，或直接以本文档第三节内嵌的完整内容为准（已逐字核对）。

**风格取向（用户已确认）**：标题宋体衬线、正文黑体、**纯系统字体**（不加载中文网络字体，国内访问稳定、零下载）。

## 三、执行步骤

### 步骤 1：新建 `_sass/_typography.scss`（唯一需要创建的文件）

在仓库根目录创建 `_sass/_typography.scss`，**完整内容如下**（上半部分为 gem 1.0.15 原文逐字保留，下半部分「中文学术排版」为新增）：

```scss
/*******************************************************************************
 * Typography styles: Headings, text, links, tables, blockquotes
 ******************************************************************************/

@use "variables" as v;

p,
h1,
h2,
h3,
h4,
h5,
h6,
em,
div,
li,
span,
strong {
  color: var(--global-text-color);
}

hr {
  border-top: 1px solid var(--global-divider-color);
}

table:not(.table) {
  td,
  th {
    font-size: 1rem;
    padding: 0.45rem 1rem 0.45rem 0;
    border-top: 1px solid var(--global-divider-color);
  }

  th {
    font-weight: 600;
  }
}

a,
table.table a {
  color: var(--global-theme-color);

  &:hover {
    color: var(--global-theme-color);
    text-decoration: underline;
  }

  &:hover:after :not(.nav-item.dropdown) {
    width: 100%;
  }
}

.table-dark {
  background-color: transparent;
  &.table-bordered {
    border: 1px solid var(--global-divider-color) !important;
  }
}

blockquote {
  background: var(--global-bg-color);
  border-left: 5px solid var(--global-theme-color);
  margin: 1.5em 0;
  padding: 1em;
  font-size: 1.2rem;

  p {
    margin-bottom: 0;
  }

  /* Tips, warnings, and dangers blockquotes */
  &.block-tip {
    border-color: var(--global-tip-block);
    background-color: var(--global-tip-block-bg);

    em,
    li,
    p,
    strong {
      color: var(--global-tip-block-text);
    }

    a,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--global-tip-block-title);
    }
  }

  &.block-warning {
    border-color: var(--global-warning-block);
    background-color: var(--global-warning-block-bg);

    em,
    li,
    p,
    strong {
      color: var(--global-warning-block-text);
    }

    a,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--global-warning-block-title);
    }
  }

  &.block-danger {
    border-color: var(--global-danger-block);
    background-color: var(--global-danger-block-bg);

    em,
    li,
    p,
    strong {
      color: var(--global-danger-block-text);
    }

    a,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--global-danger-block-title);
    }
  }
}

/* ============================================================================
 * 中文学术排版（本站自定义）
 * 覆盖 tailwind @layer base 中的 Roboto/300/1.5 规则：
 * main.css 是无层样式，优先级高于 @layer base，无需 !important。
 * ==========================================================================*/

// 黑体正文栈：macOS/iOS 苹方 → 冬青黑体 → Windows 微软雅黑 → Linux 思源/Noto
$font-sans-zh: Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif;

// 宋体标题栈：macOS 宋体-简 → 华文宋体 → Windows 华文中宋（系统自带、加粗效果好）→ 中易宋体 → Linux 思源/Noto
$font-serif-zh: "Roboto Slab", "Songti SC", "STSong", "STZhongsong", "SimSun", "Noto Serif CJK SC", "Source Han Serif SC", serif;

body {
  font-family: $font-sans-zh;
  font-weight: 400; // 中文在 300 下笔画发虚，必须提升到 400
  line-height: 1.8; // 中文方块字舒展行高
}

h1,
h2,
h3,
h4,
h5,
h6,
.post-title,
.navbar-brand,
.publications h1 {
  // 论文页年份分组标题
  font-family: $font-serif-zh;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.02em;
}

h4,
h5,
h6 {
  font-weight: 600;
}

.navbar-brand {
  letter-spacing: 0.08em; // 导航栏"王成善"三字加字距，更端庄
}

.post-header .desc {
  // 首页副标题"地质学家 · 沉积学家 · 中国科学院院士"
  font-family: $font-serif-zh;
  letter-spacing: 0.05em;
}

// 正文段落两端对齐（中文书刊排版标准）
.post article p {
  text-align: justify;
}

// 新闻日期列：等宽数字、不换行，"2025年6月24日"不折行
.news table th {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

// 头像细边框，红底照片收边更挺括
.profile img {
  border: 1px solid var(--global-divider-color);
}

// 语录区块改用宋体（红左边条等其余样式沿用上方 gem 原规则）
blockquote {
  font-family: $font-serif-zh;
}
```

### 步骤 2：不要做的事

- **不要**新建 `_sass/_variables.scss`。`main.scss` 用 `@use "variables" with ($max-content-width: ...)` 注入站点宽度，遮蔽它会引入维护风险。
- **不要**改 `_config.yml` 的 `google_fonts.url.fonts`（Roboto + Roboto Slab + Material Icons 保持不变）：拉丁字母与数字继续用 Roboto 系，Material Icons 被模板依赖；中文字形全部来自系统字体栈，零网络字体下载。
- **不要**动 `_sass/_themes.scss`（红色主题覆盖），两个覆盖文件互不冲突。

### 步骤 3：登记覆盖（消除 style-contract 告警）

`_sass/` 是 starter 仓库 style-contract 禁入路径，`npm run lint:style-contract` 失败属**预期**（本站已是王成善个人站，不再是模板仓库）。执行：

```bash
bundle exec al-folio upgrade overrides accept _sass/_typography.scss
# 如 _sass/_themes.scss 此前未登记，一并执行：
bundle exec al-folio upgrade overrides accept _sass/_themes.scss
```

并提交生成的 `.al-folio-overrides.yml`。

### 步骤 4：英文残留逐项核查（构建后目测）

1. **导航栏搜索框占位符**：由 `al_search` gem 的 `{% al_search_assets %}` 标签渲染，本仓库无法直接改文案。构建后查看：若为英文（如 "Search"），先查 al_search gem 是否有配置项；没有则将 `_config.yml` 中 `search_enabled: true` 改为 `false`（中文站搜索价值低）。
2. 页脚、404 页、CV 页（rendercv 渲染）目测一遍。
3. 暗色模式：所有新规则均使用 `var(--global-*)` 变量，天然兼容双主题，但仍需切换暗色目测一遍。

## 四、验证（Docker）

本机 shell 无 Ruby，走 Docker：

```bash
cd /e/wcs/al-folio-main
docker compose up -d
docker compose logs --tail=80            # 确认无 Sass Error / Liquid Exception
curl -fsS http://127.0.0.1:8080/al-folio/ >/dev/null   # 注意 baseurl 是 /al-folio
```

浏览器打开 `http://127.0.0.1:8080/al-folio/`，逐项核对：

1. **标题为宋体衬线且粗壮**：首页"王成善"、各页标题、"新闻动态/代表性成果"小节标题。DevTools 看 computed `font-family`，应命中 `Songti SC`（macOS）/ `STZhongsong` 或 `SimSun`（Windows）之一。
2. **正文为黑体且不纤细**：computed `font-weight` 为 400，computed `font-family` 命中 `PingFang SC` / `Microsoft YaHei`。
3. **行高舒展**：正文 computed `line-height` 为 1.8（约 28.8px）。
4. **新闻日期不折行**：首页新闻表格"2025年6月24日"单行显示。
5. **语录区块为宋体**，红色左边条仍在。
6. **暗色模式**切换后：标题/正文对比正常，红色强调色为 `#ef5350`。
7. **手机宽度**（DevTools 375px）：首页头像、新闻表格、导航折叠正常。
8. 七个导航页（首页/新闻动态/学术成果/科研项目/学术随笔/人才培养/学术简历）逐页过一遍，无排版错乱。
9. 构建日志无 `Sass Error`（重点：`_typography.scss` 的 `@use "variables" as v;` 依赖 gem 的 `_variables.scss`，若报找不到，说明 load path 异常，把报错原文贴回排查）。

通过后 `docker compose down`。

## 五、回滚

删除 `_sass/_typography.scss` 即恢复 gem 默认排版，无其他任何改动牵连。

## 六、后续可选微调（不在本次范围，供参考）

- 若 Windows 上标题宋体仍嫌单薄：安装免费的「思源宋体 / Noto Serif CJK SC」后自动命中字体栈；或把栈中 `"STZhongsong"` 提前。
- 若希望标题再醒目：可把 `--global-theme-color` 应用到 `.post-title`（在 `_typography.scss` 追加 `color: var(--global-theme-color);`）。
- 若日后想要全网统一字体（不依赖访客系统）：再评估加载 Noto Serif SC 网络字体（Google Fonts 国内不稳，需用镜像或自托管 woff2）。
