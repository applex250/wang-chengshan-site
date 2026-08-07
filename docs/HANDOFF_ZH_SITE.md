# 交接说明：王成善院士中文站点改造（供 GLM 验证执行）

> 本文档由 Claude Code 编写，交接给 GLM 完成**构建验证与收尾**。
> 改造内容：将 al-folio v1 模板站改为**中文版、红色学术风格（中国科学院院士风格）的王成善院士个人主页**。
> 改造日期：2026-08-06。

## 一、已完成的改动清单

### 1. 站点配置 `_config.yml`
- `title: 王成善`，`first_name: 王成善`（middle/last 留空）
- `description` / `footer_text` / `keywords` / `contact_note` 全部中文化
- `lang: zh-CN`，`icon: 🏔️`
- `blog_name: 学术随笔`，`blog_description` 中文化
- `giscus.lang: zh-CN`
- `external_sources:` 已清空（原演示会拉取 medium/Google 英文博文）
- `scholar.last_name: [Wang, 王]` / `first_name: [Chengshan, Cheng-Shan, C., 成善]`（论文页加粗本人姓名用）
- `display_tags: [人物报道]`，`display_categories: []`

### 2. 红色学术主题（本地覆盖 gem，属预期行为）
- 新增 `_sass/_themes.scss`：完整复制 `al_folio_core` gem（v1.0.15）同名文件后改色：
  - 亮色主题主色 `--global-theme-color: #b71c1c`（学术深红），hover `#d32f2f`
  - 暗色主题主色 `#ef5350`，hover `#e57373`
  - 亮色页脚改为深红 `#6b1414`
- ⚠️ 注意：`_sass/` 属于 starter 仓库的 style-contract 禁入路径，`npm run lint:style-contract` 会失败。但 `docs/CUSTOMIZE.md` 明确允许**用户自建站**用同名文件覆盖 gem 主题——本站已转为王成善个人站，此失败属预期。建议执行：
  `bundle exec al-folio upgrade overrides accept _sass/_themes.scss` 并提交 `.al-folio-overrides.yml`。

### 3. 页面（`_pages/`）
| 文件 | 改动 |
|---|---|
| `about.md` | 全中文首页：院士简介、研究方向、语录、荣誉列表；头像 `prof_pic.png`；`latest_posts` 关闭 |
| `news.md` | 标题「新闻动态」，加入导航 nav_order 2 |
| `publications.md` | 标题「学术成果」，nav_order 3 |
| `projects.md` | 标题「科研项目」，nav_order 4，去掉演示分类 |
| `blog.md` | 标题「学术随笔」，nav_order 5 |
| `teaching.md` | 标题「人才培养」，nav_order 6，移除演示日历 |
| `cv.md` | 标题「学术简历」，nav_order 7，去掉演示 PDF 链接 |
| `dropdown.md` / `repositories.md` / `profiles.md` | `nav: false`（保留文件、导航隐藏） |
| `404.md` | 中文化 |

### 4. 头像
- 已从 NoteGen 资料复制：`assets/img/prof_pic.png`（864×1080 肖像）。

### 5. 新闻动态（`_news/`，4 条，已删 3 条演示）
- 2025-06-24 国家科学技术进步奖一等奖
- 2024-11-06 何梁何利基金科学与技术进步奖
- 2024-05-15 PNAS 论文（地球自转阶梯式减速，含详情页）
- 2023-07-24 国家教学成果二等奖

### 6. 博文（`_posts/`）
- 33 篇英文演示博文**未删除**，移入 `_drafts/`（Jekyll 不发布，可随时恢复或彻底删除）。
- 新增中文人物报道：`2024-06-01-wang-chengshan-profile.md`（featured，含完整人物资料与荣誉列表）。

### 7. 论文库 `_bibliography/papers.bib`
- 已替换为 7 条中文题录（松科钻探、2008 PNAS 青藏高原、2024 PNAS、973/IGCP 等）。
- ⚠️ **除 `wang2008pnas` 外，其余条目卷期页码/DOI 均为占位，上线前必须逐条核实补全**（文件头部有警示注释）。

### 8. 科研项目（`_projects/`，4 个，演示 9 个移入 `_backup_demo/projects/`）
松辽盆地国际大陆科学钻探 / 青藏高原隆升 / 深时古气候与古海洋（IGCP）/ 地球自转节律与地表环境变迁。

### 9. 教学（`_teachings/`，2 门，演示 2 门移入 `_backup_demo/teachings/`）

### 10. 数据文件
- `_data/cv.yml`：已重写为王成善履历（rendercv 格式，section 名中文化）。
- `_data/socials.yml`：去 Einstein 演示；邮箱为占位 `wangchengshan@cdut.edu.cn`（**需替换**）；custom_social 指向成都理工大学。

## 二、验证步骤（GLM 执行）

本机 shell 无 Ruby，推荐 Docker 路径：

```bash
cd /e/wcs/al-folio-main
docker compose up -d
docker compose logs --tail=80        # 确认 jekyll build 无报错
curl -fsS http://127.0.0.1:8080/al-folio/    # 注意 baseurl 是 /al-folio
```

如用 slim 镜像：`docker compose -f docker-compose-slim.yml up -d`（免去本地构建镜像）。

### 逐项检查（浏览器打开 `http://127.0.0.1:8080/al-folio/`）
1. 首页导航：首页 / 新闻动态 / 学术成果 / 科研项目 / 学术随笔 / 人才培养 / 学术简历；无英文演示项。
2. 首页显示王成善简介、右侧肖像、新闻 4 条、底部红色页脚。
3. 主题色为深红（链接/标题强调色 `#b71c1c`）；暗色模式切换后强调色为 `#ef5350`。
4. 「学术成果」页渲染 7 条题录，「Wang, Chengshan」加粗；无 Einstein 条目。
5. 「学术随笔」只有 1 篇中文人物报道；搜索框搜 "Einstein/formatting" 应无结果。
6. 「学术简历」各中文小节正常渲染；若 rendercv 报错，检查 `_data/cv.yml` 缩进。
7. 「人才培养」2 门课程正常。
8. 构建日志中无 `Liquid Exception` / `Sass Error`（`_sass/_themes.scss` 的 `@use "variables"` 依赖 gem 内 `_variables.scss`，若报找不到，需把 gem 的 `_sass/_variables.scss` 也复制到本地 `_sass/`）。

验证通过后 `docker compose down`。

## 三、遗留事项（需人工/后续处理）

1. **论文题录核实**（最高优先级）：`papers.bib` 中除 2008 PNAS 外均为占位信息。
2. **邮箱** `wangchengshan@cdut.edu.cn` 为占位（`_data/socials.yml` 与 `_data/cv.yml` 两处）。
3. `assets/json/resume.json`（jsonresume 用）与 `_data/coauthors.yml`、`_data/citations.yml` 仍含演示数据；当前 `cv_format: rendercv` 用不到 resume.json，可忽略或后续清理。
4. `_drafts/`（33 篇演示博文）与 `_backup_demo/`（演示项目/课程）确认无误后可彻底删除。
5. 部署前改 `_config.yml` 的 `url`（现为 `https://alshedivat.github.io`）；若部署到个人主页仓库（`username.github.io`），`baseurl` 须置空——参考 `docs/ARCHITECTURE.md` 与 `docs/FAQ.md`。
6. `_data/socials.yml` 中 custom_social 的 logo 用了 cdut.edu.cn/favicon.ico，若加载失败可换本地图片。
7. 头像图片来自人物资料文档，请确认使用授权。

## 四、回滚方法

- 演示内容均在 `_drafts/` 与 `_backup_demo/`，移动回去即可。
- `_sass/_themes.scss` 删除即恢复 gem 默认紫青主题。
