/*
 * Swup 页面切换初始化(2026-08)
 *
 * 结构:导航栏 header 与页脚 footer 在 #swup 容器之外,切换时保持不动;
 * 仅 #swup 内容区被替换,动画见 _sass/_swup.scss(0.32s 淡出淡入)。
 *
 * 库:assets/js/vendor/swup/(swup 4.9.2 + head-plugin 2.3.1 + scripts-plugin 2.1.0,
 * 官方 UMD,本地化自托管)。库加载失败时本文件静默返回,整站回退普通整页跳转。
 */
(function () {
  // 防重复初始化双保险:脚本被意外重放时直接返回,
  // 避免创建第二个 Swup 实例(双实例会互相竞争 html 上的
  // is-animating 类,导致内容区永久 opacity:0 白屏)。
  if (window.__swupInitDone) {
    return;
  }
  window.__swupInitDone = true;

  if (typeof window.Swup !== "function") {
    return;
  }

  /*
   * DOMContentLoaded 垫片
   * gem 的页面级 JS(bibsearch/common/masonry/tabs/copy_code 等)都包在
   * document.addEventListener("DOMContentLoaded", ...) 里。swup 交换内容后
   * ScriptsPlugin 重新执行这些脚本,但真正的 DOMContentLoaded 早已触发,
   * 回调永远不会再跑——这里让"文档加载完成后才注册的 DOMContentLoaded 监听"
   * 立即执行。首次加载时(readyState === "loading")走原生路径,
   * 导航栏/页脚等持久区脚本行为完全不变、也不会被重复绑定。
   */
  const originalAddEventListener = document.addEventListener.bind(document);
  document.addEventListener = function (type, listener, options) {
    if (type === "DOMContentLoaded" && document.readyState !== "loading") {
      const event = new Event("DOMContentLoaded");
      if (typeof listener === "function") {
        listener.call(document, event);
      } else if (listener && typeof listener.handleEvent === "function") {
        listener.handleEvent(event);
      }
      return;
    }
    return originalAddEventListener(type, listener, options);
  };

  const swup = new window.Swup({
    containers: ["#swup"],
    animationSelector: '[class*="swup-transition-"]',
    plugins: [
      // 交换 <head>:更新 <title> 与页面级 meta,persistAssets 防重复加载
      new window.SwupHeadPlugin({ persistAssets: true }),
      // 重放 #swup 容器内的页面级脚本(见 _includes/scripts_page.liquid)。
      // head: false 必须:head 里的脚本归 HeadPlugin 管理,若让 ScriptsPlugin
      // 重放 head,开发环境 jekyll serve 注入的内联 document.write 脚本
      // (livereload)会被重新执行——document.write 在已加载文档上调用等于
      // document.open(),直接清空整个文档导致页面崩毁/白屏。
      new window.SwupScriptsPlugin({ head: false }),
    ],
  });

  /*
   * 容器替换前,把 #swup 之外的脚本全部标记为不重放。
   * 原理:ScriptsPlugin 的 runScripts 在 content:replace 之后遍历整个
   * document 重放脚本;此时文档 = 新容器 + 旧持久区脚本。凡是容器外的
   * 脚本都是持久区脚本(只执行一次),gem include 输出的标签(如
   * al_search 的 search-setup.js、cookie、analytics、instantpage 等)
   * 无法在 include 里加 data-swup-ignore-script,这里统一打标:
   * 否则它们会被二次执行,顶层 let/const 重复声明直接 SyntaxError,
   * 并可能破坏页面(如 livereload 的 document.write 清空文档)。
   */
  swup.hooks.before("content:replace", (visit) => {
    const main = document.getElementById("swup");
    document.querySelectorAll("body script:not([data-swup-ignore-script])").forEach((script) => {
      if (!main || !main.contains(script)) {
        script.setAttribute("data-swup-ignore-script", "");
      }
    });

    /*
     * MathJax 只加载一次:库二次初始化会抛
     * "Cannot set property Package of #<Object> which has only a getter"。
     * 在容器替换前给新页文档里的 MathJax 脚本打标,
     * 属性随 clone 进入 DOM,ScriptsPlugin 重放时自动跳过;
     * 新内容里的公式由下方 content:replace 钩子 typesetPromise() 渲染。
     */
    const toDoc = visit && visit.to && visit.to.document;
    if (toDoc) {
      toDoc.querySelectorAll('script#MathJax-script, script[src*="tex-mml-chtml"], script[src*="mathjax-setup"]').forEach(
        (script) => {
          script.setAttribute("data-swup-ignore-script", "");
        }
      );
    }
  });

  /*
   * 照片墙显隐:DOM 常驻全站(见 default.liquid + _sass/_photo-wall.scss)。
   * 2026-08 首页重构为极简 hero 后照片墙"仅不显示"(代码/图加载保留)。
   * 恢复方法:改为
   *   const segments = location.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
   *   document.body.classList.toggle("photo-wall-active", segments.length === 1);
   */
  const updatePhotoWall = () => {
    document.body.classList.remove("photo-wall-active");
  };

  /*
   * 导航栏 active 高亮同步。
   * header.liquid 的 active 类是服务端按 page.url 渲染的;swup 切换后
   * URL 已变但导航栏 DOM 持久不动,这里按 location.pathname 重新计算,
   * 规则与服务端一致:精确匹配优先,其次子页面前缀匹配
   * (如新闻详情页高亮"新闻动态"),首页链接只精确匹配。
   */
  const updateNavActive = () => {
    const nav = document.querySelector("#navbar .navbar-nav");
    if (!nav) {
      return;
    }
    const current = location.pathname.replace(/\/+$/, "") || "/";

    const setItemActive = (li, isActive, srTarget) => {
      li.classList.toggle("active", isActive);
      const sr = srTarget || li.querySelector("span.sr-only");
      if (sr) {
        sr.hidden = !isActive;
      }
    };

    const pathOf = (href) => {
      if (!href) {
        return "";
      }
      try {
        return new URL(href, location.origin).pathname.replace(/\/+$/, "");
      } catch (e) {
        return "";
      }
    };

    nav.querySelectorAll("li.nav-item:not(.dropdown)").forEach((li) => {
      const link = li.querySelector(":scope > a.nav-link");
      const hrefPath = pathOf(link && link.getAttribute("href"));
      // 首页链接 href 只有 baseurl 一段,不参与前缀匹配,避免整站常亮
      const isHome = hrefPath.split("/").filter(Boolean).length === 1;
      const isActive = hrefPath === current || (!isHome && hrefPath && current.startsWith(hrefPath + "/"));
      setItemActive(li, isActive);
    });

    nav.querySelectorAll("li.nav-item.dropdown").forEach((li) => {
      let anyActive = false;
      li.querySelectorAll(".dropdown-menu a.dropdown-item").forEach((item) => {
        const isActive = pathOf(item.getAttribute("href")) === current;
        setItemActive(item, isActive);
        if (isActive) {
          anyActive = true;
        }
      });
      setItemActive(li, anyActive);
    });
  };

  /*
   * 交换后补齐 tooltip/popover 初始化:
   * tooltips-setup.js 是全局脚本只跑一遍;新内容里的 [data-toggle] 元素
   * 由这里显式重扫(内部带 af*Bound 去重标记,重复调用安全;
   * popover 同时也会被重放的 common.js 初始化一遍,无副作用)。
   */
  swup.hooks.on("content:replace", () => {
    /*
     * MathJax 库不随切换重放,新内容里的公式在这里手动重渲染
     * (typesetPromise 对无公式内容无害,幂等)。
     */
    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
      window.MathJax.typesetPromise().catch(() => {});
    }

    updateNavActive();
    updatePhotoWall();

    if (window.AlFolioUi) {
      const root = document.getElementById("swup") || document;
      if (typeof window.AlFolioUi.initTooltips === "function") {
        window.AlFolioUi.initTooltips(root);
      }
      if (typeof window.AlFolioUi.initPopovers === "function") {
        window.AlFolioUi.initPopovers(root);
      }
    }

    /*
     * 横向滚动位置默认最左:新容器内所有可横向滚动元素重置到 0。
     * (浏览器新 DOM 默认即为 0,这里兜底防旧状态/脚本残留)
     */
    const mainRoot = document.getElementById("swup");
    if (mainRoot) {
      mainRoot.querySelectorAll("*").forEach((el) => {
        if (el.scrollLeft !== 0) {
          el.scrollLeft = 0;
        }
      });
    }

    /*
     * bibsearch.js 以 type="module" 加载——浏览器按 URL 去重,模块只求值一次,
     * ScriptsPlugin 重插同 URL 模块标签不会重跑。这里带唯一查询串动态 import
     * 强制重新求值(模块内部注册 DOMContentLoaded,由上方垫片立即触发)。
     * 每次交换内容区都是全新 DOM,不会对同一元素重复绑定。
     */
    if (document.getElementById("bibsearch")) {
      const anyScript = document.querySelector('script[src*="/assets/js/"]');
      const base = anyScript ? anyScript.src.split("/assets/js/")[0] : "";
      import(`${base}/assets/js/bibsearch.js?swup=${Date.now()}`).catch(() => {});
    }
  });

  // 初始化照片墙显隐(须在全部 const 定义之后调用,避免 TDZ 报错)
  updatePhotoWall();
})();
