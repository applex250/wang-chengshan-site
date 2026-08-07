# 王成善院士纪念网站「共和国脊梁」视觉改版实施计划

> **For Hermes:** 本计划为纯视觉/前端改版,非 TDD 型功能开发;每个任务完成后即时提交。

**Goal:** 在现有 al-folio(Jekyll + Tailwind/SCSS)学术主页基础上,将全部页面升级为「庄重纪念美学 / 红色致敬美学 / 共和国脊梁」视觉语言,让人打开页面瞬间产生敬意与认同感。

**Architecture:** 站点是 al-folio v1(Jekyll),样式体系 = gem 拥有的 SCSS(`assets/css/main.scss` 依次 `@use` themes/layout/typography/navbar/footer/blog/publications/components/utilities...)+ 站点 `_sass/` 同名文件覆盖。改版策略:**① 扩展现有覆盖文件 `_themes.scss`(色板令牌)与 `_typography.scss`(字体排版);② 新增 `_sass/_memorial.scss`(纪念组件库:纹理/印章/时间轴/展柜卡片/克制动效);③ 覆盖 gem 的 `assets/css/main.scss` 加一行 `@use "memorial";`;④ 微调已有 header/footer/cv/news 覆盖模板的类名与结构**。不动页面内容数据。

**Tech Stack:** SCSS(CSS 变量 + 嵌套)、Jekyll Liquid、已有 Tailwind 基础设施(不引入新构建链,遵守 AGENTS.md Stop sign:不建 tailwind.config.js/本地构建流水线)。

---

## 第一部分:视觉风格总结与设计说明(交付文档,将同步给用户)

### 1. 整体气质 ——「档案柜里的共和国勋章」

庄重、肃穆、有历史厚度。全站基调是**国家档案/科学家博物馆的展陈感**:炭黑与深红的底色框架、米白纸张色内容区、暗金细线勾勒秩序。页面如一份展开的荣誉档案,而非个人博客。

### 2. 色彩系统(严格遵守)

| 角色           | 色值                                                          | 用途                                |
| -------------- | ------------------------------------------------------------- | ----------------------------------- |
| 主色 深红      | `#8B1A1A`(基础)/ `#B71C1C`(现有 theme,保留)/ `#C41E3A`(hover) | 主题链接、强调线、导航 active、按钮 |
| 压暗红(底)     | `#6B1414`(现 footer 色)                                       | 页脚、hero 暗底、印章底色           |
| 强调 暗金      | `#B8860B`(深)/ `#C9A227`(亮)                                  | 装饰线、徽章、标题下划线、年份节点  |
| 中性 炭黑/暖灰 | `#1A1A1A` / `#3C3C3C` / `#6E6A64`                             | 正文、次级文本                      |
| 纸张 米白      | `#F7F3EC`(卡片/正文底)/ `#EFE9DF`(区块底)                     | 内容区底色,替代纯白                 |
| 分隔           | `rgba(139,26,26,0.18)`                                        | 细线、边框、表格线                  |

禁止:高饱和鲜艳色、霓虹、大面积亮蓝/紫。全站仅红/金/黑/米四个家族。

### 3. 图像与材质

- 现有 `prof_pic.png` 头像:加**档案框**(细金线 + 角标 + 轻微纸张纹理底),不做圆形裁剪(`image_circular: false` 已符合)
- 无历史老照片素材 → 用**材质模拟**补位:全局 `body` 叠极轻纸张噪点纹理(内联 SVG feTurbulence data-URI,~1KB,无外部请求);卡片四角「档案贴角」;章节标题旁「朱印」小徽章(深红方章 + 白字,如「院士」)
- 图片 hover:轻微亮度变化 + 1px 金边,不缩放不旋转

### 4. 排版与版式

- 标题:思源宋体变体栈(已有 `$font-serif-zh`),字重 700,字距 `0.05em`,关键标题加**暗金下饰线**(`::after` 2px 渐变金线)
- 正文:黑体栈(已有 `$font-sans-zh`)400/1.8,两端对齐(已有)
- 模块卡片:米白底 + 1px 细线边框(`#8B1A1A` 15% 透明度)+ 极轻阴影 `0 1px 3px rgba(0,0,0,0.06)`,如展柜
- 时间轴:新闻页与 CV 工作经历用「金点 + 竖线」年表样式
- 留白:克制,区块间距 `2.5rem-3rem`,卡片内 `1.5rem`

### 5. 组件与动效

- 导航:深红 hover 底 + 金色下划线;navbar-brand 已有字距 0.08em
- 按钮/链接 hover:轻微亮度(`filter: brightness(1.08)`)+ 金色描边,不做位移/弹跳
- 动效最小化:仅 `fade-in`(0.4s,`@media (prefers-reduced-motion: no-preference)` 限定)+ 滚动时卡片极轻微上浮(translateY 4px)
- 页脚:深红底 + 金色顶线 + 正式版权文案(已有,补金线)

### 6. 技术

- 响应式:断点沿用 Bootstrap/Tailwind 既有;移动端时间轴竖线左置
- 对比度:正文 `#1A1A1A` on `#F7F3EC`(≥12:1);金线仅装饰不承载信息
- 语义化:不改页面 HTML 语义结构,只加 class 与伪元素

---

## 第二部分:分步实施任务

### Task 1:设计令牌——扩展 `_sass/_themes.scss` 色板

**Files:** Modify `_sass/_themes.scss`(在 `:root` 块内追加纪念令牌)
**Step 1:** 在 `:root` 现有变量后追加:

```scss
/* —— 纪念风格令牌(共和国脊梁) —— */
--memorial-red-deep: #8b1a1a; /* 深红主色 */
--memorial-red-press: #6b1414; /* 压暗红(底) */
--memorial-gold: #b8860b; /* 暗金(深) */
--memorial-gold-light: #c9a227; /* 暗金(亮) */
--memorial-ink: #1a1a1a; /* 炭黑正文 */
--memorial-grey-warm: #6e6a64; /* 暖灰次级 */
--memorial-paper: #f7f3ec; /* 米白纸张 */
--memorial-paper-deep: #efe9df; /* 深一档纸张 */
--memorial-line: rgba(139, 26, 26, 0.18); /* 红系细线 */
--memorial-gold-line: linear-gradient(90deg, transparent, #c9a227 20%, #b8860b 80%, transparent);
```

**Step 2:** 同步把 `--global-theme-color` 调为 `#8b1a1a`、`--global-footer-bg-color` 保持 `#6b1414`、`--global-divider-color` 改为 `var(--memorial-line)`(保持红系统一)。
**Step 3:** prettier 检查 + 提交:`git add _sass/_themes.scss && git commit -m "style: 纪念色板令牌(深红/暗金/纸张)"`

### Task 2:新增 `_sass/_memorial.scss` 纪念组件库

**Files:** Create `_sass/_memorial.scss`
**Step 1:** 写四个组件模块(完整代码见附录 A):

1. `body::before` 纸张噪点纹理(SVG feTurbulence data-URI,`opacity: .035`, `pointer-events: none`, `position: fixed; inset: 0; z-index: -1`)
2. `.memorial-frame` 档案框(1px 金边 + 四角 `::before/::after` 金色角标 + 米白底)
3. `.memorial-stamp` 朱印徽章(深红方底、白字、`padding: .15em .5em`、`letter-spacing: .2em`、旋转 -2deg)
4. `.memorial-timeline` 时间轴(`li::before` 金点 + `border-left` 细红竖线;`h3` 用金色饰线)
5. `.memorial-card-hover`:卡片 hover `border-color: var(--memorial-gold-light)` + `transform: translateY(-2px)` + 0.25s ease
6. 全局 `h2::after` 金色饰线(宽 56px,高 2px,渐变)
7. `@media (prefers-reduced-motion: no-preference)` 内定义 `fade-in` 关键帧,应用给 `.post`、`.card`
   **Step 2:** 提交:`git add _sass/_memorial.scss && git commit -m "style: 纪念组件库(纹理/印章/时间轴/档案框)"`

### Task 3:覆盖 `assets/css/main.scss` 装载 memorial

**Files:** Create `assets/css/main.scss`(从 gem 复制原文件,追加一行)
**Step 1:** 从 `al-org-dev/al-folio-core` 拉 `assets/css/main.scss` 原文,在 `@use "typograms";` 之后追加 `@use "memorial";`
**Step 2:** 提交:`git add assets/css/main.scss && git commit -m "build: main.scss 装载 memorial 组件库"`

### Task 4:导航 header 庄重化

**Files:** Modify `_includes/header.liquid`(已有 override)
**Step 1:** navbar-brand 区域:标题改为 `class="navbar-brand title font-weight-bold"`(去掉 lighter),加 `data-memorial` 标记
**Step 2:** `_memorial.scss` 内补 `.navbar` 规则:active 链接深红底 + 金下划线;`box-shadow: 0 1px 0 var(--memorial-gold-line)`
**Step 3:** 提交:`git commit -m "style: 导航栏庄重化(深红 active + 金饰线)"`

### Task 5:页脚 footer 庄重化

**Files:** Modify `_includes/footer.liquid`(已有 override)
**Step 1:** 在 footer 顶部加金色饰线(`border-top: 2px solid; border-image: var(--memorial-gold-line) 1`)
**Step 2:** footer 文字色微调为 `#f3e5e5`(现)保持,链接 hover 金色
**Step 3:** 提交:`git commit -m "style: 页脚金饰线 + 庄重化"`

### Task 6:首页(about)纪念化

**Files:** Modify `_pages/about.md`(内容不动,只调 front matter) + `_memorial.scss` 补 `.profile` 规则
**Step 1:** about.md `profile.more_info` 增加一行「中国科学院院士」朱印徽章 HTML:`<p><span class="memorial-stamp">院士</span></p>`
**Step 2:** `_memorial.scss` 补:

```scss
.profile img {
  border: 1px solid var(--memorial-gold);
  padding: 4px;
  background: var(--memorial-paper);
}
.profile .memorial-stamp {
  display: inline-block;
  margin-top: 0.4rem;
}
```

**Step 3:** 提交:`git commit -m "style: 首页肖像档案框 + 院士朱印"`

### Task 7:CV 页时间轴化

**Files:** Modify `_includes/cv/render.liquid`(已有 override)
**Step 1:** section 卡片容器加 class:`<div class="card mt-3 p-3 memorial-frame">`(档案框)
**Step 2:** 工作经历/教育经历条目:在 `_memorial.scss` 给 `.cv .list-group-item` 加时间轴竖线样式(金点 + 左侧细线),CV 卡片标题 h3 加金色饰线
**Step 3:** 提交:`git commit -m "style: CV 页档案框 + 经历时间轴"`

### Task 8:新闻页时间轴化

**Files:** Modify `_includes/news.liquid`(已有 override)+ `_memorial.scss`
**Step 1:** news 表格容器加 `.memorial-timeline` class;日期列 `<th>` 金色年份样式
**Step 2:** 提交:`git commit -m "style: 新闻页时间轴年表化"`

### Task 9:论文/项目/书籍页展柜化

**Files:** Modify `_memorial.scss`(纯 CSS,不改模板)
**Step 1:** `.publications .card`、`.projects .card`、`.books .card` 统一:`background: var(--memorial-paper)`、1px 红系细线、hover 金边 + 上浮 2px
**Step 2:** 提交:`git commit -m "style: 论文/项目/书籍展柜卡片"`

### Task 10:响应式与无障碍收尾

**Files:** Modify `_memorial.scss`
**Step 1:** 移动端(`@media (max-width: 576px)`):时间轴竖线左移 8px、朱印缩小、hero 标题字号 clamp() 兜底
**Step 2:** 核对对比度:正文/次级文本色达标(>7:1),装饰线不承载信息
**Step 3:** 提交:`git commit -m "style: 响应式 + 无障碍收尾"`

### Task 11:全站验证与部署

**Files:** 全部改动
**Step 1:** `npx prettier . --check`(用仓库锁定的 prettier 3.8.0,node 用 nvm 25.7.0)预期:All matched files use Prettier code style!
**Step 2:** `git push origin main` → 等 CI(Deploy site / Prettier / broken links)全绿
**Step 3:** 抓取 gh-pages 产物验证:首页 `.memorial-stamp`、CV 页 `memorial-frame`、news 页 `memorial-timeline` 类名存在;抽查页面无布局错乱(对比改版前 HTML 结构差异)
**Step 4:** 汇报 + 请用户强刷验收

---

## 第三部分:关键组件代码示例(附录 A,写文件时直接使用)

### 纸张纹理(data-URI,放 `_memorial.scss`)

```scss
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

### 档案框(四角金色角标)

```scss
.memorial-frame {
  position: relative;
  background: var(--memorial-paper);
  border: 1px solid var(--memorial-line);
}
.memorial-frame::before,
.memorial-frame::after,
.memorial-frame .corner::before,
.memorial-frame .corner::after {
  /* 四角 18px 金 L 形,用 border-top/left 组合 */
}
```

(实现时用两层伪元素+子元素或 `background: linear-gradient` 四角技巧,避免过度复杂;最终以 prettier 通过的写法为准)

### 时间轴

```scss
.memorial-timeline {
  list-style: none;
}
.memorial-timeline li {
  position: relative;
  padding-left: 1.4rem;
  border-left: 1px solid var(--memorial-line);
}
.memorial-timeline li::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 0.55em;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--memorial-gold);
  border: 2px solid var(--memorial-paper);
}
```

### 朱印

```scss
.memorial-stamp {
  display: inline-block;
  padding: 0.12em 0.55em;
  background: var(--memorial-red-press);
  color: #f5e9e0;
  font-family: var(--font-serif-zh, "Songti SC", serif);
  font-weight: 700;
  letter-spacing: 0.25em;
  font-size: 0.8rem;
  transform: rotate(-2deg);
  border: 1px solid rgba(201, 162, 39, 0.55);
}
```

---

## 第四部分:后续优化建议(3-5 条,交付给用户)

1. **历史素材补位**:用户若能提供王成善院士早期工作照/手稿/野外笔记/奖章照片(黑白扫描件尤佳),可做「档案时间轴」图文区块,视觉说服力远超纹理模拟。
2. **字体资产化**:目前标题依赖系统宋体栈;后续可自托管思源宋体子集(woff2,仅常用字)或引入正式中文字体 CDN,统一跨平台观感(需权衡加载体积与合规)。
3. **首页叙事化重构**:将首页从「简介+公告」升级为「院士档案」三段式(生平年表 hero → 成就展柜 → 语录与手迹),更贴近科学家博物馆专题页结构(需用户确认内容取舍)。
4. **动效进阶**:滚动进入视口时章节标题「金线展开」动画(IntersectionObserver + CSS transition,~20 行 JS),仍保持克制。
5. **无障碍与多端审计**:用 axe-core 跑一次全站对比度/ARIA 审计;打印样式(media print)单独打磨,让页面打印出来像一份正式档案。

---

## 风险与开放问题

- **R1 覆盖维护成本**:新增覆盖 gem 的 `assets/css/main.scss`,gem 升级后需 diff 重合并(已有 .al-folio-overrides.yml 机制记录;执行后跑 `bundle exec al-folio upgrade overrides audit` 补登记,需 ruby 环境——conda `jekyll` env 已就绪但缺编译链,可暂缓,以 prettier/CI 验证为准)。
- **R2 中文字体渲染差异**:Linux(本机 Noto CJK)与 Windows/macOS 观感不同,标题栈已按平台回退设计,可接受。
- **R3 视觉验收盲区**:本机无浏览器,「好看」的最终判断依赖用户浏览器强刷验收;计划内验证以类名/结构/CI 为准,视觉细节按用户反馈迭代。
- **R4 内容零改动原则**:本次只动样式与模板 class,不动已核实的履历/论文/新闻数据,避免引入新的内容错误。
- **开放问题**:首页 hero 是否需要更大的版式重构(任务 6 仅做「档案框+朱印」轻改,大重构列入后续建议 3,需用户拍板)。
