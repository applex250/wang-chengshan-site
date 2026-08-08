# 首页沉浸式横向滚动照片墙 Implementation Plan

> **For Hermes:** 按任务逐个提交;纯静态(Liquid + SCSS + 压缩素材),无 JS 运行时逻辑。

**Goal:** 用素材库 16-17 张王成善照片做首页**动态背景照片墙**:不规则画廊式错落布局、透明度 20-40%、微模糊景深、横向无缝无限滚动,现代极简高级,不压主页内容。

**Architecture:** 纯 CSS 实现——`_data/photo_wall.yml` 定义每张照片的布局参数(宽/错位/旋转/模糊/透明度/层级)→ Liquid 生成双套照片序列 DOM → `transform: translateX(0→-50%)` 匀速无缝循环。照片墙 fixed 定位 z-index:-1(在 body 五层纹理之上、主内容之下),左右/上下渐变遮罩沉入底色。素材预压缩为 640px 墙版(原图共 ~30MB,墙版目标 <2MB)。

**Tech Stack:** Liquid / SCSS / Jekyll(al-folio v1 派生站) / PIL(素材压缩脚本)

---

## 背景与现状

- 素材库:`assets/img/photos/` 17 个图片文件(尺寸 573×278 ~ 7952×5304,共 ~30MB)——**必须压缩**才能做背景
- 首页:`_pages/about.md`(layout: `about` → `_layouts/about.liquid`)
- 现有背景:body 五层纹理(`--memorial-bg-layers` + `body::before`,z-index:-1)
- 层级方案:照片墙 `.photo-wall` fixed + z-index:-1 → 层叠顺序 `body背景 → body::before → 照片墙 → 主内容`,自动在内容之下,**无需改主内容 z-index**
- 站点 baseurl 非根 → 图片路径必须用 `relative_url` 过滤器

## 文件清单

| 文件 | 操作 | 内容 |
|---|---|---|
| `scripts/build_wall_assets.py` | 新建 | 压缩素材脚本(PIL,最长边 640px,JPEG q70) |
| `assets/img/wall/*.jpg` | 生成 | 17 张墙版压缩图(每张 20-80KB) |
| `_data/photo_wall.yml` | 新建 | 17 项布局参数(file/w/y/rot/blur/z/o/w) |
| `_includes/photo-wall.html` | 新建 | 照片墙 DOM(Liquid 双套序列) |
| `_sass/_photo-wall.scss` | 新建 | 布局/动画/遮罩/降级/移动端 |
| `assets/css/main.scss` | 修改 | `@use "photo-wall";` |
| `_layouts/about.liquid` | 修改 | 页面末尾 `{% include photo-wall.html %}` |
| `.hermes/plans/2026-08-08_010000-photo-wall-homepage.md` | 新建 | 本计划 |

---

## Task 1: 生成墙版压缩素材

**Objective:** 17 张原图压缩为背景可用的小图,总大小 <2MB。

**Files:** 新建 `scripts/build_wall_assets.py`,输出 `assets/img/wall/`

**Step 1:** 写脚本:遍历 `assets/img/photos/*.jpg|png` → PIL 打开 → 最长边缩到 640px → JPEG quality=70(`png` 转 jpg,白底) → 同名存 `assets/img/wall/`;输出每张的 KB 数与总计。

**Step 2:** 运行:`python3 scripts/build_wall_assets.py`
期望:17 张全部生成,单张 <100KB,总 <2MB;最大原图(unesco 6.3MB)墙版 <80KB。

**Step 3:** 提交
```bash
git add scripts/build_wall_assets.py assets/img/wall/
git commit -m "assets: 照片墙压缩素材(17 张,640px 墙版)"
```

## Task 2: 布局参数数据

**Objective:** 定义 17 张照片的不规则画廊布局(人工编排,非网格)。

**Files:** 新建 `_data/photo_wall.yml`

**Step 1:** 17 项,每项字段:
- `id`: 序号(1-17,供 CSS 精细控制)
- `file`: 墙版文件名
- `w`: 格子宽 px(140-340,小图 140-180、大合影/工作照 240-340,错落)
- `y`: 垂直错位 px(-30 ~ +30,margin-top)
- `rot`: 微旋转 deg(-3 ~ +3,画廊感;克制,不嬉皮)
- `blur`: 景深模糊 px(0 或 1.5,1/3 照片 1.5px 制造景深)
- `z`: 层叠(0-3,交错)
- `o`: 透明度 0.2-0.4(用户要求 20-40%;官方肖像/工作照 0.32 突出,图解/远景 0.22 沉底)

**Step 2:** 校验:17 项、file 与 wall/ 目录逐一对应(python 断言),无缺失。

**Step 3:** 提交 `git commit -m "data: 照片墙布局参数(17 张不规则编排)"`

## Task 3: 照片墙 DOM

**Objective:** Liquid 生成双套照片序列(无缝滚动靠 50% 平移 + 内容复制)。

**Files:** 新建 `_includes/photo-wall.html`

**Step 1:** 结构:
```html
{% if page.layout == 'about' %}
<div class="photo-wall" aria-hidden="true">
  <div class="photo-wall-track">
    {% for copy in (0..1) %}{% for p in site.data.photo_wall %}
      <figure class="pw-item" style="--w:{{ p.w }}px; --y:{{ p.y }}px; --rot:{{ p.rot }}deg; --blur:{{ p.blur }}px; --z:{{ p.z }}; --o:{{ p.o }};">
        <img src="{{ '/assets/img/wall/' | append: p.file | relative_url }}" alt="" loading="lazy" decoding="async" draggable="false">
      </figure>
    {% endfor %}{% endfor %}
  </div>
</div>
{% endif %}
```
(两套 17 张 = 34 个 figure;`page.layout == 'about'` 保证只有首页渲染)

**Step 2:** prettier 校验:`npx prettier --write _includes/photo-wall.html`

**Step 3:** 提交 `git commit -m "feat: 照片墙 DOM(双套无缝序列)"`

## Task 4: 照片墙样式与动画

**Objective:** 不规则布局 + 慢速无缝滚动 + 遮罩 + 降级。

**Files:** 新建 `_sass/_photo-wall.scss`

**Step 1:** 布局与动画:
```scss
.photo-wall {
  position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden;
  &::before, &::after {   /* 左右渐变遮罩,沉入底色 */
    content: ""; position: absolute; top: 0; bottom: 0; width: 10vw;
    background: linear-gradient(90deg, var(--global-bg-color), transparent);
    z-index: 2; }
  &::after { right: 0; transform: scaleX(-1); }
  &::before { left: 0; }
}
.photo-wall-track {
  position: absolute; top: 50%; left: 0; display: flex; align-items: flex-start;
  gap: 0; width: max-content; transform: translateY(-50%);
  animation: pw-scroll 160s linear infinite; will-change: transform;
}
.pw-item {
  flex: none; margin: 0 14px; margin-top: var(--y); z-index: var(--z);
  transform: rotate(var(--rot)); filter: blur(var(--blur));
  opacity: var(--o); width: var(--w); border-radius: 3px;
  box-shadow: 0 6px 24px rgba(26, 26, 26, 0.10);
  img { display: block; width: 100%; height: auto; }
}
@keyframes pw-scroll { from { transform: translateY(-50%) translateX(0); } to { transform: translateY(-50%) translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .photo-wall-track { animation: none; }
}
@media (max-width: 768px) { .photo-wall { display: none; } }
```

**Step 2:** 说明:translateX(-50%) 时两套序列总宽一半,正好从第 1 张位置平移到第 17 张位置 → 无缝。速度 8500px/160s ≈ 53px/s,缓慢优雅。

**Step 3:** 提交 `git commit -m "style: 照片墙布局与无缝滚动动画"`

## Task 5: 集成装载

**Objective:** 让照片墙进入构建与首页。

**Files:** 修改 `assets/css/main.scss`、`_layouts/about.liquid`

**Step 1:** `main.scss` 在 `@use "footer";` 后加 `@use "photo-wall";`

**Step 2:** `about.liquid` 文件末尾(内容区结束前)加 `{% include photo-wall.html %}`

**Step 3:** prettier + 提交 `git commit -m "feat: 首页集成照片墙背景"`

## Task 6: 验证与发布

**Objective:** CI 全绿 + 线上产物确认。

**Step 1:** `npx prettier . --check` 全绿

**Step 2:** 推送,等 CI(Prettier + Deploy + broken links)

**Step 3:** 抓 gh-pages `index.html` 验证:
- `.photo-wall` 存在
- 34 个 `.pw-item`(17×2)
- 图片 src 含 `/assets/img/wall/` 且 relative_url 正确(带 baseurl)
- 墙版素材在 gh-pages `assets/img/wall/` 下存在(gh api 抽查 2 个文件名)

**Step 4:** 提交收尾 commit(如有格式修正)

---

## 风险与权衡

| 风险 | 对策 |
|---|---|
| 原图 30MB 拖垮页面 | 墙版 640px/70 压缩,总 <2MB;`loading="lazy"` |
| 照片墙压过文字 | 透明度 20-40% + 左右 10vw 渐隐 + z-index:-1 在内容下;文字区自带底色 |
| 动画卡顿 | 纯 `transform`(GPU 合成)+ `will-change`;无 JS |
| 移动端流量/拥挤 | ≤768px 隐藏照片墙 |
| 用户动效敏感 | `prefers-reduced-motion` 静止 |
| 无缝断裂 | 双套序列 + translateX(-50%),周期整数对齐 |
| 官方肖像 182×273 太小 | 放最小格子(140-160px 宽)+ 1.5px blur,作为"档案照"点缀 |
| baseurl 部署路径 | 全部 `relative_url` |

## 开放问题

1. 17 张全部上墙,还是剔除 `deep_coring_technology_diagram`(573×278 技术图解)保持 16 张?默认**全上**(图解也是档案叙事一环),你可指定剔除。
2. 滚动方向:默认向右滚动(内容左移,translateX 负),可改左滚。
3. 速度 160s/循环,可调(120-200s)。
