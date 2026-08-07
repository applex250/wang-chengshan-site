# 王成善院士个人主页

> 基于 [al-folio](https://github.com/alshedivat/al-folio) v1 模板改造的**中文、红色学术风格**个人学术主页。
> 纯静态站点（Jekyll 构建），**无后端服务器**。

- 仓库：<https://github.com/applex250/wang-chengshan-site>
- 本地预览：<http://127.0.0.1:8080/al-folio/>（运行 Docker 后）

站点包含：首页简介 · 新闻动态 · 学术成果 · 科研项目 · 学术随笔 · 人才培养 · 学术简历。

---

## 一、技术本质

这是一个 **Jekyll 静态站点**：内容用 Markdown + YAML + BibTeX 书写，构建时编译成纯 HTML/CSS/JS，托管到任意静态服务（GitHub Pages、Cloudflare Pages 等）。**没有自建后端、没有数据库、没有运行时服务端代码。** 所谓"动态"能力，要么在**构建时**生成，要么交给**第三方服务**。

## 二、前后端设计

### 整体架构：瘦启动 + gem 运行时

```
┌──────────────────────────────────────────────────┐
│  本仓库 = "瘦启动器"                               │
│  只拥有：内容、配置、本地覆盖、文档、测试           │
└───────────────┬──────────────────────────────────┘
                │ 依赖（Gemfile + _config.yml plugins）
                ▼
┌──────────────────────────────────────────────────┐
│  Ruby gems（运行时全在这，版本化）                  │
│  al_folio_core  → 布局 / include / Sass / JS       │
│  al_search      → 命令面板（ninja-keys）           │
│  al_cookie      → Cookie 同意                      │
│  jekyll-scholar → BibTeX 文献渲染                  │
└──────────────────────────────────────────────────┘
```

模板、样式、脚本**不在本仓库**，而在 gem 内。需要改 gem 行为时，用「同名文件本地覆盖」（见第七节）。

### "后端"在哪？（三种伪后端）

| 需求                           | 实现方式                                       | 发生时机                |
| ------------------------------ | ---------------------------------------------- | ----------------------- |
| 文献列表 / 引用                | jekyll-scholar 读 `papers.bib` 生成 HTML       | **构建时**              |
| 站内搜索                       | 构建索引 + 浏览器端 ninja-keys 过滤            | 构建时 + **纯客户端**   |
| 评论                           | Giscus（基于 GitHub Discussions 的第三方组件） | 运行时，服务端是 GitHub |
| 主题切换 / 复制按钮 / 折叠展开 | 原生 JS                                        | 客户端                  |

### 前端技术栈

| 层   | 技术                                                                      |
| ---- | ------------------------------------------------------------------------- |
| 内容 | Markdown + YAML frontmatter                                               |
| 数据 | YAML（`_data/`）、BibTeX（`_bibliography/`）                              |
| 模板 | Liquid（`{{ }}` / `{% %}`，主要在 gem 内）                                |
| 样式 | Sass + Tailwind CSS（gem 内编译），本地 `_sass/_themes.scss` 覆盖红色主题 |
| 脚本 | 原生 JS + 第三方库（ninja-keys、highlightjs 等）                          |
| 字体 | Google Fonts（Roboto），中文走系统雅黑类回退                              |

## 三、目录结构

```
_config.yml              主配置（标题/导航/插件/主题色变量等）
Gemfile                  gem 依赖（pin 在已发布版本）
_pages/                  各页面（首页 about、news、publications、projects、blog、teaching、cv）
_news/                   新闻条目（短公告）
_posts/                  博文（长文章）
_projects/               科研项目
_teachings/              课程
_data/                   cv.yml / socials.yml / coauthors.yml / citations.yml 等
_bibliography/papers.bib 论文库
_layouts/  _includes/    本地覆盖 gem 模板（汉化，见第七节）
_sass/_themes.scss       红色主题覆盖
assets/                  图片（含 prof_pic.png）、css、js
bin/entry_point.sh       Docker 启动脚本
Dockerfile / docker-compose*.yml
docs/                    架构 / 边界 / FAQ 等文档
.github/workflows/       CI 与部署工作流
_drafts/  _backup_demo/  模板演示遗留（未被发布，可删）
```

## 四、本地运行（Docker，推荐）

```bash
docker compose up -d                      # 启动 → http://127.0.0.1:8080/al-folio/
docker compose logs -f                    # 实时看构建日志（含 --watch 热重建）
docker compose down                       # 停止
```

- 容器以 `--watch --force_polling --livereload` 运行，**改内容/样式会自动重建**，刷新浏览器即可。
- 改 `_config.yml` 或新增 `_includes/`/`_layouts/` 覆盖文件后，执行一次 `docker compose restart`。
- 构建产物写到**容器内** `/tmp/_site`（非仓库 `_site/`，避免 host bind-mount 写死锁），以浏览器为准。

> 用完整预构建镜像 `amirpourmand/al-folio:latest`（含全部系统依赖）。slim 镜像因过于精简无法运行 `entry_point.sh`，已弃用。

## 五、内容怎么更新

| 要改什么                 | 改哪里                                                                 |
| ------------------------ | ---------------------------------------------------------------------- |
| 首页简介 / 肖像          | `_pages/about.md`、`assets/img/prof_pic.png`                           |
| 一条新闻                 | `_news/` 新增 `YYYY-MM-DD-xxx.md`（`layout: post`，可 `inline: true`） |
| 一篇博文                 | `_posts/` 新增 `YYYY-MM-DD-xxx.md`                                     |
| 科研项目                 | `_projects/` 新增/编辑（标题/描述/正文）                               |
| 课程                     | `_teachings/`                                                          |
| 论文                     | `_bibliography/papers.bib` 增删条目                                    |
| 简历                     | `_data/cv.yml`                                                         |
| 联系方式 / 社交          | `_data/socials.yml`                                                    |
| 导航 / 站点标题 / 主题色 | `_config.yml`                                                          |

保存后等几秒自动重建，刷新即可。提交并推送到 GitHub：

```bash
git add -A && git commit -m "说明" && git push
```

## 六、部署到 GitHub Pages

仓库已带 `.github/workflows/` 部署工作流。上线前需改 `_config.yml`：

- `url` 改成你的域名（如 `https://applex250.github.io`）；
- 若部署到**用户主页仓**（`applex250.github.io`），`baseurl` 须**置空**；若是项目仓（`applex250.github.io/wang-chengshan-site`），保留 `baseurl: /wang-chengshan-site`。

推送到 `main` 即触发自动构建与发布。详见 `docs/FAQ.md`。

## 七、本站相对模板的定制

1. **红色学术主题**：本地 `_sass/_themes.scss` 覆盖 gem 默认配色（主色 `#b71c1c`，深红页脚 `#6b1414`）。
2. **全站汉化**：13 个 `_layouts/`/`_includes/` 本地覆盖 gem 模板（首页分区标题、页脚、导航、文献按钮、新闻/博文日期、课程标签等）；命令面板（Cmd-K）由 `_includes/footer.liquid` 内一段运行时 JS 中文化。
3. **项目页**：改为首页式正文排版（无卡片）。
4. **favicon**：`_config.yml` 的 `icon` 改为汉字「王」。

> 本地覆盖属 al-folio 文档认可的「用户站」用法。代价：`npm run lint:style-contract` 会报 `_sass/`/`_layouts/`/`_includes/` 命中（同一已接受类别）。将来 gem 升级可用 `bundle exec al-folio upgrade overrides audit` 查漂移。

## 八、遗留事项（上线前务必处理）

- ⚠️ **论文题录**：`_bibliography/papers.bib` 中除 `wang2008pnas` 外，卷期页码/DOI 均为占位，需逐条核实补全。
- ⚠️ **邮箱**：`_data/socials.yml` 与 `_data/cv.yml` 的 `wangchengshan@cdut.edu.cn` 为占位，需替换为真实邮箱。
- 头像 `assets/img/prof_pic.png` 来源请确认使用授权。
- `_drafts/`（33 篇演示博文）、`_backup_demo/`（演示项目/课程）、`readme_preview/`、`lighthouse_results/` 为模板遗留，确认无误后可删。

## 九、相关文档

- `docs/ARCHITECTURE.md` — 架构与本地覆盖机制（权威）
- `docs/BOUNDARIES.md` — 功能到 gem 的归属表
- `docs/FAQ.md` — 常见问题（含部署）
- `docs/CUSTOMIZE.md` — 自定义指南（主题色、字体、功能开关）
- `CLAUDE.md` / `AGENTS.md` — 给 AI 编程助手的工程约定

---

_Built with [Jekyll](https://jekyllrb.com/) and the [al-folio](https://github.com/alshedivat/al-folio) starter._
