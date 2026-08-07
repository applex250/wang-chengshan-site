# 米白色系向中性灰调靠拢改版计划

> **For Hermes:** 纯色板调整,按任务逐个提交;完成后推送 CI 验证。

**Goal:** 将全站暖米白/纸张色系(页面背景、卡片底、纪念组件令牌)由偏黄暖调改为**中性灰调**,呈现国家级学术网站"理性、庄重、权威"的气质,同时保持明度层次与文字对比度。

**Architecture:** 所有目标色值都是 `_sass/_themes.scss` 中的 CSS 变量(`--global-bg-color` / `--global-card-bg-color` / `--global-newsletter-bg-color` / `--memorial-paper` / `--memorial-paper-deep`),消费方(body 背景、卡片、档案框、时间轴、newsletter)全部通过 `var()` 引用——**改变量即全局生效**,无需动任何模板/组件文件。

**Tech Stack:** SCSS(CSS 变量),无结构改动。

---

## 一、现状调研(只读完成)

| 色值 | 变量 | 语义/消费方 |
|---|---|---|
| `#F3F1EC` | `--global-bg-color` | 页面整体背景(layout.scss `body`) |
| `#EFE9DF` | `--global-card-bg-color` | 卡片/展柜底(components、projects、CV 卡片) |
| `#EFE9DF` | `--global-newsletter-bg-color` | 新闻简报订阅框底 |
| `#F7F3EC` | `--memorial-paper` | 纪念组件纸张令牌(档案框底、时间轴金点描边、朱印关联) |
| `#EFE9DF` | `--memorial-paper-deep` | 深一档纸张令牌(卡片底对比) |

`#F2F0EB` 在仓库代码中**不存在**(用户从浏览器 DevTools 取到的可能为混合渲染色),计划中按同系映射处理,若执行时发现残留则一并替换。

色彩属性分析(均为暖黄调:R 通道 > G > B):
- `#F3F1EC` = RGB(243, 241, 236),偏黄 +7
- `#EFE9DF` = RGB(239, 233, 223),偏黄 +16
- `#F7F3EC` = RGB(247, 243, 236),偏黄 +11

## 二、灰色调映射方案(保持明度层次,去黄)

| 现值 | 语义 | 新值(中性灰,保留 ~2% 微暖) | 说明 |
|---|---|---|---|
| `#F3F1EC` | 页面背景 | **`#F1F1EF`** | RGB(241,241,239),中性浅灰,微暖可忽略 |
| `#EFE9DF` | 卡片/深一档 | **`#E9E9E7`** | RGB(233,233,231),中灰白,与背景保持层次 |
| `#F7F3EC` | 纸张令牌 | **`#F2F2F0`** | RGB(242,242,240),同背景系 |
| `#F2F0EB` | (若存在) | `#EEEEEC` | 备用映射 |

**层次关系(必须保持)**:背景 `#F1F1EF` < 卡片 `#E9E9E7`(卡片略深)→ 展柜感不破坏。

**对比度核算**:
- 正文 `#1A1A1A` on `#F1F1EF` ≈ 16:1 ✅(远超 AAA)
- 次级 `#6E6A64` on `#F1F1EF` ≈ 5.5:1 ✅(AA)
- 金色日期 `#B8860B` on `#E9E9E7` ≈ 3.2:1(装饰性,不承载唯一信息)✅

**色调协调**:深红 `#8B1A1A`、暗金 `#B8860B` 在灰调底上更显沉稳理性,与「国家级荣誉展厅」定位契合;灰调不引入蓝/紫,仍属中性,不与红色纪念美学冲突。

## 三、分步实施任务

### Task 1:变量色值替换
**Files:** Modify `_sass/_themes.scss`(仅 5 处变量值)
**Step 1:** `:root` 中:
```scss
--global-bg-color: #f1f1ef;
--global-card-bg-color: #e9e9e7;
--global-newsletter-bg-color: #e9e9e7;
--memorial-paper: #f2f2f0;
--memorial-paper-deep: #e9e9e7;
```
**Step 2:** 更新注释(`/* 米白纸张 */` → `/* 中性浅灰纸张 */` 等),说明灰色调定位
**Step 3:** 提交:`git commit -m "style: 米白色系向中性灰调靠拢(背景/卡片/纸张令牌)"`

### Task 2:消费方残留检查
**Files:** 只读检查 `_sass/_memorial.scss`、`_includes/`、`_pages/`
**Step 1:** `grep -rni "f3f1ec\|efe9df\|f7f3ec\|f2f0eb" _sass/ _includes/ _pages/ assets/` 预期:仅 `_themes.scss` 变量定义(消费方全是 `var()` 引用)
**Step 2:** 确认纪念组件(档案框/时间轴/朱印)无硬编码米白
**Step 3:** 提交:无改动则跳过

### Task 3:对比度与一致性验证
**Files:** 无(计算核对)
**Step 1:** 核对正文/次级文本在新底色上的对比度(≥7:1 达标,已核算)
**Step 2:** 确认深色模式不受影响(dark 块不含这些变量)
**Step 3:** 提交:无改动则跳过

### Task 4:验证与部署
**Step 1:** `nvm use 25.7.0 && npx prettier . --check` → 预期全绿
**Step 2:** `git push origin main` → CI(Prettier / Deploy / broken links)全绿
**Step 3:** 抓取 gh-pages 产物:
- `main.css` 含 `#f1f1ef`、`#e9e9e7`、`#f2f2f0`,且无旧值 `#f3f1ec`/`#efe9df`/`#f7f3ec` 残留
**Step 4:** 汇报,请用户强刷验收(整体观感应为中性浅灰、无黄调)

---

## 四、风险与开放问题

- **R1 灰色偏冷?**:映射保留 ~2% 微暖(非纯灰 `#F1F1F1`),若用户要"更冷/更中性",可继续推进到纯灰,±1 档即可切换。
- **R2 展柜层次感**:卡片 `#E9E9E7` 与背景 `#F1F1EF` 的明度差 = 8,与改版前一致(原 #EFE9DF vs #F3F1EC 同为 8),层次不丢失。
- **R3 浏览器渲染差异**:不同屏幕色域下灰调观感略有差异,属正常;验收后按反馈微调。
- **开放问题**:金色饰线/朱印是否需要随灰调微调(如金线降饱和)?默认不动(金+灰是经典档案馆配色);用户如觉得金太跳可后续单独调。
