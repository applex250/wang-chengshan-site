# 院士官网高级档案纸背景质感升级实施计划

> **For Hermes:** 纯 CSS 背景改版,按任务逐个提交;完成后推送 CI 验证。

**Goal:** 将全站单调纯色背景升级为「国家级荣誉展厅 / 档案室」级的多层质感背景——远看纯净、近看有细腻材质,权威庄重理性,不影响文字与人物展示。

**Architecture:** 背景全部挂在 `body` 上,四层叠加:① 底色 `#F3F1EC`(CSS 变量);② `radial-gradient` 微渐变(空间层次);③ 暖灰纸纹 SVG(data-URI feTurbulence,档案纸纤维);④ 细微颗粒噪点(复用现有 memorial 噪点)。另保留 `body::before` 承载「不可见级」第五层纹理(pseudo element 要求)。透明度全部 3%–8%,无装饰图案、无花纹、无强渐变。

**Tech Stack:** SCSS(`_sass/_themes.scss` 变量 + `_sass/_memorial.scss` 背景层)、内联 SVG data-URI(零外部请求)、CSS 变量做深色模式适配。

---

## 一、现状调研结论(只读)

| 项         | 现状                                                                    | 结论                                                     |
| ---------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| 页面底色   | `--global-bg-color: v.$white-color`(gem 变量,纯白)                      | **这就是「单调纯色」来源,需替换**                        |
| 卡片底     | `--global-card-bg-color: #f7f3ec`(已米白)                               | 保留,与新底色协调(略加深一档)                            |
| 现有噪点   | `_sass/_memorial.scss` `body::before` feTurbulence,opacity 0.035        | 复用为颗粒层,并入多层背景                                |
| 背景挂载点 | gem `_layout.scss`:`body { background-color: var(--global-bg-color); }` | override 中给 `body` 追加 `background-image` 多层,不冲突 |
| 深色模式   | `html[data-theme="dark"]` 深灰底                                        | 渐变层需用 CSS 变量按主题切换,深色下避免白色高光         |

## 二、设计说明:五层背景结构

```
body 背景(从上到下叠加):
┌─────────────────────────────────────────────┐
│ L1 微渐变 radial-gradient(空间层次)      ← 最上层 │  rgba(255,255,255,0.5) 中心微亮 → 透明
│ L2 暖灰纸纹 SVG(档案纸纤维)               │  opacity 0.04,暖灰 #8a8378,低频 feTurbulence
│ L3 细微颗粒噪点(自然颗粒层次)             │  opacity 0.035,高频 feTurbulence(现有复用)
│ L0 底色 #F3F1EC                          ← 最底层 │  暖白米灰,国家级学术网站常用
└─────────────────────────────────────────────┘
body::before(position: fixed; z-index: -1):第五层「不可见级」纹理
   暖灰纸纹变体,opacity 0.02,几乎不可察觉,满足 pseudo element 要求
```

**关键参数(用户指定,严格遵守):**

- 底色:`#F3F1EC`
- 暖灰纸纹:opacity 0.04
- 渐变:`rgba(255,255,255,0.5)`
- 颗粒:opacity 0.03–0.05
- 禁止:复古泛黄、明显花纹、强渐变、科技炫光、商业宣传风

**视觉效果:** 第一眼是高级纯净的暖白档案纸;细看有纤维、颗粒、轻微明暗纵深;文字对比度 ≈ 14:1 不受影响。

## 三、分步实施任务

### Task 1:底色切换到 #F3F1EC

**Files:** Modify `_sass/_themes.scss`
**Step 1:** `:root` 中 `--global-bg-color` 由 `#{v.$white-color}` 改为 `#f3f1ec`
**Step 2:** 卡片/新闻简报底色 `--global-card-bg-color`、`--global-newsletter-bg-color` 由 `#f7f3ec` 改为 `#efe9df`(与新底色拉开一档,展柜层次更清晰)
**Step 3:** 提交:`git commit -m "style: 页面底色切换为高级暖白 #f3f1ec"`

### Task 2:微渐变层(空间层次)

**Files:** Modify `_sass/_memorial.scss`(新增「10. 背景质感」段)
**Step 1:** 给 `body` 追加多层背景,第一层渐变用 CSS 变量承载(供深色模式切换):

```scss
body {
  background-image: var(--memorial-bg-layers);
}
```

**Step 2:** 在 `_themes.scss` `:root` 定义:

```scss
--memorial-bg-layers:
  radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0) 62%),
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='2' seed='7'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' fill-opacity='0.04'/%3E%3C/svg%3E"),
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' fill-opacity='0.035'/%3E%3C/svg%3E");
```

(纸纹 `baseFrequency 0.5` 低频 = 纤维感;颗粒 `0.9` 高频 = 细噪点;两层 SVG 均为灰阶噪点,在米白底上呈暖灰)
**Step 3:** 提交:`git commit -m "style: body 多层背景(渐变+纸纹+颗粒)"`

### Task 3:暖灰纸纹独立验证

**Files:** 无新文件(在 Task 2 的层内)
**Step 1:** 纸纹层 SVG 的 `fill-opacity='0.04'` 已内置(用户指定 0.04),无需额外 opacity
**Step 2:** 核对 data-URI 转义:单引号包裹、`%23` 替代 `#`、`%25` 替代 `%`,prettier 后无语法破坏
**Step 3:** 提交:并入 Task 2,无独立提交

### Task 4:pseudo element 不可见级纹理

**Files:** Modify `_sass/_memorial.scss`
**Step 1:** 现有 `body::before` 噪点(0.035)替换为暖灰纸纹变体(低频 0.4,opacity 0.02):

```scss
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.02;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' seed='11'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E");
}
```

**Step 2:** 提交:`git commit -m "style: body::before 升级为不可见级纸纹层"`

### Task 5:深色模式适配

**Files:** Modify `_sass/_themes.scss`
**Step 1:** `html[data-theme="dark"]` 内覆盖 `--memorial-bg-layers`:

```scss
--memorial-bg-layers:
  radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0) 62%), url("...纸纹(同上,fill-opacity 0.05)..."),
  url("...颗粒(同上,fill-opacity 0.04)...");
```

(深色下白色高光降为 0.06 微光,纸纹/颗粒微增以保持可见;底色仍是深灰变量)
**Step 2:** 提交:`git commit -m "style: 深色模式背景层适配"`

### Task 6:全局样式一致性检查

**Files:** Modify `_sass/_memorial.scss`(如有需要)
**Step 1:** 检查 `main.scss` 装载顺序:memorial 在最后,`body` 背景规则不与其他 partial 冲突(gem `_layout.scss` 只设 `background-color`,不设 `background-image` → 无冲突)
**Step 2:** 确认 `background-attachment: fixed` 不添加(iOS Safari 已知问题;滚动时纹理移动几乎不可察觉,不加)
**Step 3:** 提交:无改动则跳过

### Task 7:验证与部署

**Step 1:** `nvm use 25.7.0 && npx prettier . --check` → 预期 All matched files use Prettier code style!(SVG data-URI 长行若超宽,prettier 会包装,注意不要让 `%` 转义被破坏;必要时对 `_themes.scss` 的变量行加 `/* prettier-ignore */`)
**Step 2:** `git push origin main` → CI(Prettier / Deploy site / broken links)全绿
**Step 3:** 抓取 gh-pages 产物验证:

- `assets/css/main.css` 含 `#f3f1ec` 与 `fractalNoise`(编译成功)
- `index.html` 的 `body` 元素样式正常加载(无构建报错)
  **Step 4:** 汇报,请用户浏览器强刷验收(远看纯净、近看纤维颗粒、无泛黄/花纹)

---

## 四、风险与开放问题

- **R1 纹理浓度主观性**:0.02–0.05 是设计目标,但不同屏幕(高 PPI/低 PPI)观感差异大;落地后按用户反馈微调 opacity(±0.01 粒度)。
- **R2 SVG data-URI 转义风险**:两层 SVG 内嵌 CSS 变量字符串,prettier 重排可能破坏转义;验证步骤已含编译检查,若有问题用 `/* prettier-ignore */` 保护。
- **R3 深色模式纹理**:深色下纸纹/颗粒几乎不可见属正常(深色底噪声被吸收);如需深色也细腻,后续可单独调参,非本次范围。
- **R4 z-index 层级**:`body::before`(z-index: -1)需 body 背景不遮挡——background-image 属于 body 自身绘制层,::before 在其上、内容之下,现有生产已验证此模式可行。
- **开放问题**:是否给「卡片区」也加极轻纸纹(区别于页面整体背景)?默认不加(避免过度设计),用户如想要可后续补。
