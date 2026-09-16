/* ============================================================
   The Falling Apple · 交互脚本
   - 苹果光标 lerp 惯性跟随
   - 直接顺畅滑动（Lenis + GSAP ScrollTrigger）
   - 第三幕：cicichen 风格 Tab 切换（教育技能 / 实习经历 / 荣誉奖项）
   - 树下女孩点击：无缝替换为被砸女孩素材 + 灵感迸发
   - 高度计实时同步、反重力吐槽气泡、Lightbox
   ============================================================ */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const hasGsap = typeof window.gsap !== "undefined";
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ============ Lenis 平滑滚动 ============ */
  let lenis = null;
  if (window.Lenis && !reducedMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.3 });
    else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ============ 自定义苹果光标（lerp 惯性跟随） ============ */
  const cursor = $("#cursor");
  const cursorLabel = $(".cursor-label", cursor);
  if (cursor && isFinePointer) {
    let mx = -100, my = -100, cx = -100, cy = -100, rafId = null;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; start(); });
    window.addEventListener("mousedown", () => cursor.classList.add("is-press"));
    window.addEventListener("mouseup", () => cursor.classList.remove("is-press"));
    const loop = () => {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      cursor.style.transform = `translate(${cx - cursor.offsetWidth / 2}px, ${cy - cursor.offsetHeight / 2}px)`;
      rafId = requestAnimationFrame(loop);
    };
    const start = () => { if (rafId === null) rafId = requestAnimationFrame(loop); };
    const hoverTargets = "a, button, .cici-tab-btn, figure, #girl-interact-zone, input, [role='button']";
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest(hoverTargets);
      if (t) {
        cursor.classList.add("is-hover");
        cursorLabel.textContent = t.dataset.cursorLabel || (t.id === "girl-interact-zone" ? "点我砸苹果" : "");
      } else {
        cursor.classList.remove("is-hover");
      }
    });
  }

  /* ============ 第三幕 · cicichen 风格 Tab 切换 ============ */
  const tabBtns = $$(".cici-tab-btn");
  const tabPanels = $$(".cici-panel");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const bar = $(".cici-tab-bar");
      // 记录切换前 tab 栏是否吸顶中：短面板切换会让页面高度塌缩、滚动位置被浏览器夹到后方区块，需重新对齐
      const wasStuck = bar && bar.getBoundingClientRect().top <= 1;
      const targetId = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const targetPanel = $(`#${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
        if (hasGsap && window.ScrollTrigger) {
          ScrollTrigger.refresh();
        }
        // 吸顶状态下切换：把滚动位置重新锚定到 tab 栏吸顶点，避免跳到后方区块
        if (wasStuck && bar) {
          const y = bar.getBoundingClientRect().top + window.scrollY;
          if (typeof lenis !== "undefined" && lenis) lenis.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        }
      }
    });
  });

  /* ============ 区块 reveal（GSAP / IO） ============ */
  function initReveals() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (hasGsap && window.ScrollTrigger && !reducedMotion) {
      items.forEach((el) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        });
      });
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
      }, { threshold: 0.15 });
      items.forEach((el) => io.observe(el));
    }
  }

  /* ============ 高度计（8m → 0m） + 章节导航 ============ */
  const altValue = $("#alt-value");
  const dots = $$(".alt-dots a");
  const acts = ["act1", "act2", "act3", "act4", "act5"];
  const updateAltimeter = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (altValue) altValue.textContent = (8 * (1 - progress)).toFixed(1);
    let current = "act1";
    acts.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) current = id;
    });
    dots.forEach((d) => d.classList.toggle("is-active", d.dataset.act === current));
  };
  window.addEventListener("scroll", updateAltimeter, { passive: true });
  dots.forEach((d) => d.addEventListener("click", (e) => { e.preventDefault(); scrollTo("#" + d.dataset.act); }));

/* ============ 反重力彩蛋（向上滚动吐槽，随机出现） ============ */
const QUIPS = [
"是反重力！牛顿要被气醒了",
"地心引力：你们礼貌吗"
];
let lastY = window.scrollY, lastBubbleAt = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    const goingUp = y < lastY - 45;
    lastY = y;
    if (!goingUp || y < 100) return;
    const now = Date.now();
    if (now - lastBubbleAt < 6500) return;
    lastBubbleAt = now;
    const b = document.createElement("div");
    b.className = "ag-bubble hand-card";
    b.textContent = QUIPS[Math.floor(Math.random() * QUIPS.length)];
    b.style.left = 18 + Math.random() * 55 + "vw";
    b.style.top = 22 + Math.random() * 45 + "vh";
    $("#bubble-layer").appendChild(b);
    setTimeout(() => b.remove(), 2700);
  }, { passive: true });

  /* ============ Lightbox（生活照 & 旅行照点击看大图） ============ */
  const lightbox = $("#lightbox");
  const lbGrid = $("#lb-grid");
  const lbZoom = $("#lb-zoom");
  const lbZoomImg = $("#lb-zoom-img");
  const openLightbox = (html) => {
    lbGrid.innerHTML = html;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
  };
  const closeLightbox = () => {
    lightbox.hidden = true;
    lbZoom.hidden = true;
    document.body.style.overflow = "";
    if (lenis) lenis.start();
  };
  $$("[data-group] figure img").forEach((img) => {
    img.addEventListener("click", () => {
      openLightbox(`<img src="${img.src}" alt="" style="max-width:88vw;max-height:82vh;width:auto;border:3px solid var(--bg)">`);
    });
  });
  lbGrid.addEventListener("click", (e) => {
    if (e.target.matches("[data-zoom]")) { lbZoomImg.src = e.target.src; lbZoom.hidden = false; }
    else closeLightbox();
  });
  lbZoom.addEventListener("click", () => (lbZoom.hidden = true));
  $(".lb-close").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lightbox.hidden) closeLightbox(); });

  /* ============ 大草坪：树下女孩点击切换素材（被砸女孩）+ 灵感迸发 ============ */
  const girlZone = $("#girl-interact-zone");
  const girlImg = $("#girl-main-img");
  const quoteBubble = $("#quote-bubble");
  const quoteText = $(".quote-text", quoteBubble);
  const particles = $("#inspire-particles");

  const DEFAULT_GIRL_SRC = "assets/img/girl/girl-sitting-aligned.png";
  const HIT_GIRL_SRC = "assets/img/girl/girl-hit-aligned.png";

  // 预加载被砸状态图：点击时秒换，不因网络慢而"看起来没反应"
  const hitPreloader = new Image();
  hitPreloader.src = HIT_GIRL_SRC;

  const INSPIRATION_QUOTES = [
    "被砸中是运气，接得住是本事。",
    "把每个负向实验都追到归因为止。",
    "数据不会说谎，但要学会提问。",
    "AI 是杠杆，产品人是支点。",
    "会讲故事的数据，更有说服力。",
    "生活的苹果也会砸中你——记得抬头。"
  ];
  let quoteIndex = 0;

  const triggerGirlHit = () => {
    // 1. 更换素材（非叠加，直接替换图片 src）
    girlImg.src = HIT_GIRL_SRC;

    // 2. 轮换灵感文案
    quoteIndex = (quoteIndex + 1) % INSPIRATION_QUOTES.length;
    quoteText.textContent = `"${INSPIRATION_QUOTES[quoteIndex]}"`;

    // 3. 产生苹果粒子与弹性反馈
    if (hasGsap && !reducedMotion) {
      gsap.fromTo(girlImg, { scale: 0.95, rotation: -2 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2)" });
      gsap.fromTo(quoteBubble, { scale: 0.9, y: 5 }, { scale: 1, y: 0, duration: 0.4, ease: "back.out(2)" });

      for (let i = 0; i < 14; i++) {
        const p = document.createElement("span");
        p.className = "particle is-apple";
        particles.appendChild(p);
        gsap.fromTo(p,
          { x: 0, y: 0, scale: 0.3, opacity: 1 },
          {
            x: (Math.random() - 0.5) * 360,
            y: -50 - Math.random() * 220,
            rotation: (Math.random() - 0.5) * 360,
            scale: 0.6 + Math.random() * 0.6,
            opacity: 0,
            duration: 1 + Math.random() * 0.6,
            ease: "power2.out",
            onComplete: () => p.remove()
          }
        );
      }
    }
  };

  girlZone?.addEventListener("click", triggerGirlHit);

  /* ============ 联系方式一键复制（邮箱 / 微信号） ============ */
  const bindCopy = (sel, toastText) => {
    $(sel)?.addEventListener("click", async function () {
      const text = Object.values(this.dataset)[0];
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
      }
      const toast = $("#toast");
      toast.textContent = toastText;
      toast.hidden = false;
      toast.classList.add("show");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => { toast.classList.remove("show"); toast.hidden = true; }, 1800);
    });
  };
  bindCopy("#copy-email", "邮箱已复制 ✓");
  bindCopy("#copy-wechat", "微信号已复制 ✓");

  /* ============ 回到顶部 ============ */
  $("#back-to-crown")?.addEventListener("click", () => scrollTo("#act1"));

  /* ============ 平滑锚点 ============ */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1 && $(id)) { e.preventDefault(); scrollTo(id); }
    });
  });

  /* ============ 产品心法：弧形轮盘 ✖️ 访客共创 ✖️ 主人管理 ✖️ 释放平铺全套系统 ============ */
  const initMindsetArcSystem = () => {
    const deckTrack = $("#mindset-deck-track");
    const deckWrap = $("#mindset-deck-wrap");
    const wallWrap = $("#mindset-wall-wrap");
    const wallGrid = $("#mindset-wall-grid");
    const dotsContainer = $("#deck-dots-container");
    const prevBtn = $("#btn-deck-prev");
    const nextBtn = $("#btn-deck-next");
    const toggleViewBtn = $("#btn-toggle-mindset-view");
    const collapseBtn = $("#btn-collapse-to-deck");
    const ownerModeBtn = $("#btn-toggle-owner-mode");
    const editModal = $("#mindset-edit-modal");
    const modalContent = $("#modal-edit-content");
    const modalAuthor = $("#modal-edit-author");
    const modalAuthorRow = $("#modal-author-row");
    const modalSaveBtn = $("#btn-save-edit-modal");
    const modalCancelBtn = $("#btn-cancel-edit-modal");
    const modalCloseBtn = $("#btn-close-edit-modal");

    if (!deckTrack) return;

    /* ---- Supabase 云端共享：心法全员可见 + 站主口令鉴权管理 ---- */
    const SB_URL = "https://urhbxlrabjvsyesdqmse.supabase.co";
    const SB_KEY = "sb_publishable__pY87xPS68T7oYQaB24nsQ_TguDNPBI";
    const sb = (window.supabase && window.supabase.createClient)
      ? window.supabase.createClient(SB_URL, SB_KEY) : null;
    let sbOwner = null;   // 携带管理口令请求头的客户端（管理模式激活时创建）
    let cloudAll = null;      // 云端未删除的心法（owner + guest）
    let cloudDeletedIds = new Set(); // 云端已软删除的 id（网页不再显示，库里保留）

    const getOwnerToken = () => sessionStorage.getItem("yiyang_owner_token") || "";
    const ensureOwnerClient = () => {
      const token = getOwnerToken();
      if (!token) return null;
      if (!sbOwner) sbOwner = window.supabase.createClient(SB_URL, SB_KEY, {
        global: { headers: { "x-owner-token": token } }
      });
      return sbOwner;
    };

    // 拉取云端心法（失败时降级用本地缓存，不阻塞首屏）
    const loadCloudMindsets = async () => {
      if (!sb) return;
      try {
        const { data, error } = await sb.from("mindsets")
          .select("id,type,content,author,created_at,edited,deleted")
          .eq("status", "approved")
          .order("created_at", { ascending: true });
        if (error) throw error;
        const rows = data || [];
        cloudAll = rows.filter(r => !r.deleted).map(r => ({
          id: r.id, type: r.type, content: r.content,
          author: r.author || "神秘访客", edited: !!r.edited,
          time: r.created_at ? new Date(r.created_at).getTime() : Date.now()
        }));
        cloudDeletedIds = new Set(rows.filter(r => r.deleted).map(r => r.id));
        localStorage.setItem("yiyang_cloud_guest_cache", JSON.stringify(cloudAll.filter(r => r.type === "guest")));
      } catch (e) {
        console.warn("云端心法拉取失败，降级用本地缓存：", e.message);
        try { cloudAll = JSON.parse(localStorage.getItem("yiyang_cloud_guest_cache") || "[]"); }
        catch { cloudAll = []; }
      }
      refreshMindsetViews();
    };

    // 首次开启管理模式：把 6 条核心心法种入云端（已存在则跳过）
    const seedCoreMindsetsToCloud = async () => {
      const client = ensureOwnerClient();
      if (!client) return;
      const { data } = await client.from("mindsets").select("id").eq("type", "owner");
      const have = new Set((data || []).map(r => r.id));
      const missing = CORE_MINDSETS_DATA.filter(m => !have.has(m.id));
      if (!missing.length) return;
      const { error } = await client.from("mindsets").insert(missing.map(m => ({
        id: m.id, type: "owner", content: m.html, author: "YUNLlly", status: "approved"
      })));
      if (error) console.warn("核心心法入云失败：", error.message);
      else loadCloudMindsets();
    };

    // 本人核心心法（可编辑内容）
    const CORE_MINDSETS_DATA = [
      { id: "core-1", type: "owner", fullWidth: false, html: '在变化的时代，基于历史经验的规划像是在用<mark>后视镜开车</mark>。' },
      { id: "core-2", type: "owner", fullWidth: false, html: '试图立刻取悦所有人，几乎会导致<mark>取悦不了任何人</mark>。' },
      { id: "core-3", type: "owner", fullWidth: true, html: '<strong>"AI is everything"这句话本身就是个陷阱</strong>，就和当年的"移动互联网 is everything"一样。说这句话的时候，移动互联网已经变成了基础设施，而不是差异化。<br><br>AI 也一样：当所有产品都 AI 化，AI 本身就不再是 everything；当只有少数 AI 化，AI 就是竞争力。<strong>所有产品 AI 化之后，AI 就变成了基础设施，不再是卖点，竞争回归到你用 AI 做出了什么。</strong>' },
      { id: "core-4", type: "owner", fullWidth: false, html: '当获取答案的成本和时间趋近于 0 时，<mark>判断力</mark>成为了 AI 时代的核心竞争力。' },
      { id: "core-5", type: "owner", fullWidth: false, html: '<mark>Learn in public.</mark><br><span class="quote-footnote">（在公开透明中构建影响力与迭代自我）</span>' },
      { id: "core-6", type: "owner", fullWidth: true, html: '团队应像<mark>传教士般拥有共同愿景</mark>，而非简单的任务执行者。' }
    ];

    // 读取本地存储中的心法覆盖数据（编辑/删除）
    const getMindsetOverrides = () => {
      try {
        return JSON.parse(localStorage.getItem("yiyang_mindset_overrides") || "{}");
      } catch { return {}; }
    };
    const saveMindsetOverrides = (obj) => {
      localStorage.setItem("yiyang_mindset_overrides", JSON.stringify(obj));
    };

    // 读取本地存储中的访客心法
    const getSavedGuestMindsets = () => {
      try {
        return JSON.parse(localStorage.getItem("yiyang_guest_mindsets") || "[]");
      } catch { return []; }
    };
    const saveGuestMindset = (text, author) => {
      const list = getSavedGuestMindsets();
      const id = "guest-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      const authorName = author || "神秘访客";
      list.push({ id, text, author: authorName, time: Date.now() });
      localStorage.setItem("yiyang_guest_mindsets", JSON.stringify(list));
      // 同步写入云端（所有访客共享）；失败不影响本机体验
      if (sb) {
        sb.from("mindsets").insert({
          id, type: "guest", content: text, author: authorName, status: "approved"
        }).then(({ error }) => {
          if (error) console.warn("云端保存失败，本条仅本机可见：", error.message);
          else if (cloudAll) cloudAll.push({ id, type: "guest", content: text, author: authorName, edited: false, time: Date.now() });
        });
      }
      return list;
    };

    // 访客心法数据源：云端已加载 → 云端 + 本机未同步成功的合并；否则用本地
    const getGuestSource = () => {
      if (cloudAll === null) return getSavedGuestMindsets();
      const cloudGuestRows = cloudAll.filter(r => r.type === "guest")
        .map(r => ({ id: r.id, text: r.content, author: r.author, time: r.time }));
      const localOnly = getSavedGuestMindsets().filter(l =>
        !cloudGuestRows.some(c => c.id === l.id) && !cloudDeletedIds.has(l.id));
      return [...localOnly, ...cloudGuestRows];
    };

    // 合并所有心法为统一列表（云端已加载时，优先以云端为准）
    const getAllMindsets = () => {
      const overrides = getMindsetOverrides();
      const cloudById = cloudAll ? new Map(cloudAll.map(r => [r.id, r])) : null;

      const coreList = CORE_MINDSETS_DATA
        .filter(m => !overrides[m.id + "_deleted"] && !(cloudDeletedIds && cloudDeletedIds.has(m.id)))
        .map(m => {
          const ov = overrides[m.id];
          const c = cloudById ? cloudById.get(m.id) : null;
          return {
            id: m.id,
            type: "owner",
            num: m.id.replace("core-", "").padStart(2, "0"),
            fullWidth: m.fullWidth,
            html: ov ? ov.html : (c ? c.content : m.html),
            isEdited: !!ov || !!(c && c.edited)
          };
        });

      const guestList = getGuestSource()
        .filter(g => !overrides[g.id + "_deleted"])
        .map((g, i) => {
          const ov = overrides[g.id];
          const c = cloudById ? cloudById.get(g.id) : null;
          return {
            id: g.id,
            type: "guest",
            num: "G" + (i + 1).toString().padStart(2, "0"),
            fullWidth: false,
            html: ov ? ov.html : escapeHtml(g.text),
            author: ov && ov.author ? ov.author : g.author,
            isEdited: !!ov || !!(c && c.edited)
          };
        });

      return [...coreList, ...guestList];
    };

    let activeIndex = 0;
    let isOwnerMode = false;
    let editingMindsetId = null;
    let currentView = "deck"; // 当前视图：deck=弧形轮盘 / wall=平铺便签墙
    let cardElements = () => $$(".mindset-card-item", deckTrack);

    // 数据变更后统一刷新：重渲染轮盘 + 按当前视图刷新对应画面（保证编辑/删除即时生效，逻辑闭环）
    const refreshMindsetViews = () => {
      renderDeckCards();
      activeIndex = Math.min(Math.max(activeIndex, 0), $$(".mindset-card-item", deckTrack).length - 1);
      if (currentView === "wall") {
        renderWall();
      } else {
        updateDeck(true);
      }
    };

    // 构建单张心法卡片 HTML
    const buildCardHTML = (m) => {
      const isGuest = m.type === "guest";
      const guestBadge = isGuest ? `<span class="guest-deck-badge">✦ 访客共创</span>` : "";
      const guestAuthor = isGuest && m.author
        ? `<span class="guest-deck-author">—— ${escapeHtml(m.author)}</span>`
        : "";
      const editBadge = m.isEdited ? `<span class="edited-dot" title="已编辑">✎</span>` : "";

      return `
        <span class="mindset-num">${m.num}</span>
        <div class="mindset-card-body">
          <span class="card-pin-tape"></span>
          ${guestBadge}${editBadge}
          <p class="mindset-quote">${m.html}</p>
          ${guestAuthor}
        </div>
        <div class="card-owner-actions">
          <button type="button" class="btn-card-action btn-edit" data-edit-id="${m.id}" title="编辑此心法">✎</button>
          <button type="button" class="btn-card-action btn-del" data-del-id="${m.id}" title="删除此心法">×</button>
        </div>
      `;
    };

    // 构建访客共创输入卡片 HTML
    const buildGuestEditorHTML = () => `
      <span class="mindset-num">07+</span>
      <div class="mindset-card-body">
        <div class="editor-header">
          <span class="editor-sparkle">✦ 灵感共创</span>
          <span class="editor-tip">写下一条你的产品心法</span>
        </div>
        <textarea id="guest-mindset-input" class="guest-input-area" placeholder="在此写下你的一条产品心法或思考灵感..." rows="3"></textarea>
        <div class="editor-meta-row">
          <input type="text" id="guest-author-input" class="guest-author-area" placeholder="你的署名（如：小明 / PM新手）" maxlength="16" />
        </div>
        <div class="editor-btn-group">
          <button type="button" class="btn-sub-write" id="btn-add-another-mindset" title="暂存当前并再写一条">
            <span>✍️ 再写一条</span>
          </button>
          <button type="button" class="btn-main-release" id="btn-release-mindset" title="将所有心法释放平铺在草坪上！">
            <span class="release-glow"></span>
            <span class="release-txt">🍎 释放心法 · 铺满草坪</span>
          </button>
        </div>
      </div>
    `;

    // 渲染全部卡片到轮盘
    const renderDeckCards = () => {
      const all = getAllMindsets();
      deckTrack.innerHTML = "";

      all.forEach((m) => {
        const card = document.createElement("article");
        card.className = `mindset-card-item hand-card ${m.type === "guest" ? "is-guest" : ""} ${m.fullWidth ? "full-width" : ""}`;
        card.dataset.id = m.id;
        card.dataset.idx = all.indexOf(m);
        card.innerHTML = buildCardHTML(m);
        deckTrack.appendChild(card);
      });

      // 追加访客共创输入卡片
      const editorCard = document.createElement("article");
      editorCard.className = "mindset-card-item mindset-guest-editor hand-card";
      editorCard.dataset.id = "guest-editor";
      editorCard.innerHTML = buildGuestEditorHTML();
      deckTrack.appendChild(editorCard);

      // 绑定卡片点击（切换激活）
      $$(".mindset-card-item", deckTrack).forEach((card, i) => {
        card.addEventListener("click", (e) => {
          // 管理模式下点击编辑/删除按钮
          if (e.target.closest(".btn-card-action")) {
            if (!isOwnerMode) return; // 只允许管理模式编辑/删除
            e.stopPropagation();
            const editBtn = e.target.closest(".btn-edit");
            const delBtn = e.target.closest(".btn-del");
            if (editBtn) openEditModal(editBtn.dataset.editId);
            if (delBtn) deleteMindset(delBtn.dataset.delId);
            return;
          }
          // 点击非激活卡片
          if (i !== activeIndex && !card.classList.contains("mindset-guest-editor")) {
            activeIndex = i;
            updateDeck();
          }
        });
      });

      // 重新绑定访客输入区按钮
      bindGuestEditorActions();
    };

    // 绑定访客共创区按钮
    const bindGuestEditorActions = () => {
      const guestInput = $("#guest-mindset-input");
      const authorInput = $("#guest-author-input");
      const addAnotherBtn = $("#btn-add-another-mindset");
      const releaseBtn = $("#btn-release-mindset");

      addAnotherBtn?.addEventListener("click", () => {
        const txt = guestInput?.value.trim();
        const author = authorInput?.value.trim();
        if (!txt) {
          guestInput?.focus();
          if (window.gsap) gsap.fromTo(guestInput, { x: -6 }, { x: 0, duration: 0.3, ease: "bounce.out" });
          return;
        }
        saveGuestMindset(txt, author);
        guestInput.value = "";
        const toast = $("#toast");
        if (toast) {
          toast.textContent = "已存入灵感便签，继续写下一条 ✦";
          toast.hidden = false;
          toast.classList.add("show");
          clearTimeout(toast._t);
          toast._t = setTimeout(() => { toast.classList.remove("show"); toast.hidden = true; }, 2000);
        }
        triggerReleaseExplosion(addAnotherBtn);
        guestInput?.focus();
        // 重新渲染轮盘，新增的访客心法会显示
        renderDeckCards();
        activeIndex = $$(".mindset-card-item", deckTrack).length - 2; // 指向新增的访客心法
        updateDeck(true);
      });

      releaseBtn?.addEventListener("click", () => {
        const txt = guestInput?.value.trim();
        const author = authorInput?.value.trim();
        if (txt) {
          saveGuestMindset(txt, author);
          guestInput.value = "";
        }
        switchToWall(true);
      });
    };

    // 打开编辑弹窗
    const openEditModal = (id) => {
      editingMindsetId = id;
      const all = getAllMindsets();
      const m = all.find(x => x.id === id);
      if (!m) return;

      // 填充弹窗内容
      modalContent.value = stripHtml(m.html);

      // 访客心法可编辑署名
      if (m.type === "guest" && m.author) {
        modalAuthorRow.hidden = false;
        modalAuthor.value = m.author;
      } else {
        modalAuthorRow.hidden = true;
      }

      editModal.hidden = false;
      modalContent.focus();
    };

    // 云端同步编辑（站主鉴权）：更新正文 + 标记已编辑 + 首次编辑时留档原始内容
    const syncCloudEdit = (id, newHtml, oldHtml, guestAuthor) => {
      const client = ensureOwnerClient();
      if (!client) return; // 未开管理模式 → 仅本机生效
      (async () => {
        const { data: row } = await client.from("mindsets")
          .select("original_content").eq("id", id).maybeSingle();
        const payload = { content: newHtml, edited: true,
          original_content: (row && row.original_content) || oldHtml };
        if (guestAuthor) payload.author = guestAuthor;
        const { data: rows, error } = await client.from("mindsets")
          .update(payload).eq("id", id).select();
        if (error) console.warn("云端编辑失败：", error.message);
        else if (!rows || rows.length === 0) console.warn("云端编辑未生效（管理口令可能不正确）");
      })();
    };

    // 保存编辑
    const saveEdit = () => {
      if (!editingMindsetId) return;
      const newHtml = escapeHtml(modalContent.value.trim()).replace(/\n/g, "<br>");
      if (!newHtml) return;

      const oldHtml = (getAllMindsets().find(m => m.id === editingMindsetId) || {}).html || newHtml;
      const guestAuthor = modalAuthorRow && !modalAuthorRow.hidden
        ? (modalAuthor.value.trim() || "神秘访客") : null;

      const overrides = getMindsetOverrides();
      const editData = { html: newHtml };
      if (guestAuthor) editData.author = guestAuthor;
      overrides[editingMindsetId] = editData;
      saveMindsetOverrides(overrides);

      syncCloudEdit(editingMindsetId, newHtml, oldHtml, guestAuthor);

      closeEditModal();
      refreshMindsetViews();

      const toast = $("#toast");
      if (toast) {
        toast.textContent = "心法已更新 ✓";
        toast.hidden = false;
        toast.classList.add("show");
        clearTimeout(toast._t);
        toast._t = setTimeout(() => { toast.classList.remove("show"); toast.hidden = true; }, 1800);
      }
    };

    // 关闭编辑弹窗
    const closeEditModal = () => {
      editModal.hidden = true;
      editingMindsetId = null;
      modalContent.value = "";
      if (modalAuthor) modalAuthor.value = "";
    };

    // 删除心法（软删除：云端 deleted=true，库里保留但网页不再显示；仅管理模式可用）
    const deleteMindset = (id) => {
      if (!isOwnerMode) return; // 双保险：非管理模式直接拒绝
      const overrides = getMindsetOverrides();
      overrides[id + "_deleted"] = true;
      saveMindsetOverrides(overrides);
      const client = ensureOwnerClient();
      const showToast = (text) => {
        const toast = $("#toast");
        if (toast) {
          toast.textContent = text;
          toast.hidden = false;
          toast.classList.add("show");
          clearTimeout(toast._t);
          toast._t = setTimeout(() => { toast.classList.remove("show"); toast.hidden = true; }, 1800);
        }
      };
      if (client) {
        client.from("mindsets").update({ deleted: true }).eq("id", id).select()
          .then(({ data: rows, error }) => {
            if (error || !rows || rows.length === 0) {
              console.warn("云端删除未同步：", error ? error.message : "口令可能不对或该条不在云端");
              showToast("已删除（仅本机生效，云端未同步）");
            } else {
              showToast("心法已删除 ✗（云端已同步）");
            }
          });
      } else {
        showToast("已删除（仅本机生效）");
      }

      refreshMindsetViews();
    };

    // 切换管理模式（开启时需设置/输入管理口令，用于云端编辑删除鉴权）
    const toggleOwnerMode = () => {
      if (!isOwnerMode && sb) {
        let token = getOwnerToken();
        if (!token) {
          token = (prompt("请设置管理口令（云端编辑/删除的鉴权凭证，请牢记）：") || "").trim();
          if (!token) return; // 取消 → 不开启
          sessionStorage.setItem("yiyang_owner_token", token);
        }
        ensureOwnerClient();
        seedCoreMindsetsToCloud();
      }
      isOwnerMode = !isOwnerMode;
      document.body.classList.toggle("body-owner-mode", isOwnerMode);
      if (ownerModeBtn) {
        ownerModeBtn.classList.toggle("is-admin-active", isOwnerMode);
        $(".mode-text", ownerModeBtn).textContent = isOwnerMode ? "退出管理" : "管理模式";
        $(".mode-icon", ownerModeBtn).textContent = isOwnerMode ? "🔒" : "✏️";
      }

      const toast = $("#toast");
      if (toast) {
        toast.textContent = isOwnerMode ? "管理模式已开启 · 可编辑/删除所有心法" : "管理模式已关闭";
        toast.hidden = false;
        toast.classList.add("show");
        clearTimeout(toast._t);
        toast._t = setTimeout(() => { toast.classList.remove("show"); toast.hidden = true; }, 2000);
      }
    };

    // 绑定管理操作事件
    ownerModeBtn?.addEventListener("click", toggleOwnerMode);
    modalSaveBtn?.addEventListener("click", saveEdit);
    modalCancelBtn?.addEventListener("click", closeEditModal);
    modalCloseBtn?.addEventListener("click", closeEditModal);
    editModal?.addEventListener("click", (e) => {
      if (e.target === editModal) closeEditModal();
    });
    // 键盘快捷键：Escape 关闭弹窗，Ctrl+Enter 保存
    document.addEventListener("keydown", (e) => {
      if (editModal.hidden) return;
      if (e.key === "Escape") closeEditModal();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveEdit(); }
    });

    // 重新计算并渲染弧形轨迹
    const updateDeck = (animate = true) => {
      const cards = cardElements();
      const total = cards.length;
      if (activeIndex < 0) activeIndex = 0;
      if (activeIndex >= total) activeIndex = total - 1;

      // 更新小圆点指示器
      if (dotsContainer) {
        dotsContainer.innerHTML = "";
        for (let i = 0; i < total; i++) {
          const dot = document.createElement("button");
          dot.className = `deck-dot ${i === activeIndex ? "active" : ""}`;
          dot.setAttribute("aria-label", `切换到第 ${i + 1} 条`);
          dot.addEventListener("click", () => {
            activeIndex = i;
            updateDeck();
          });
          dotsContainer.appendChild(dot);
        }
      }

      // 计算每张卡片在抛物线/弧形轨道上的几何坐标
      const isMobile = window.innerWidth <= 768;
      const xSpacing = isMobile ? 180 : 250;
      const yDropFactor = isMobile ? 18 : 22;
      const rotAngle = isMobile ? 4.8 : 5.8;

      cards.forEach((card, i) => {
        const diff = i - activeIndex;
        const absDiff = Math.abs(diff);

        const tx = diff * xSpacing;
        const ty = Math.pow(absDiff, 1.85) * yDropFactor;
        const rot = diff * rotAngle;
        const scale = Math.max(0.72, 1 - absDiff * 0.08);
        const opacity = absDiff > 2 ? 0 : Math.max(0.18, 1 - absDiff * 0.35);
        const zIndex = 50 - absDiff;

        card.classList.toggle("is-active", diff === 0);
        card.style.zIndex = zIndex;

        if (window.gsap && animate) {
          gsap.to(card, {
            x: tx,
            y: ty,
            rotation: rot,
            scale: scale,
            opacity: opacity,
            duration: 0.45,
            ease: "power2.out"
          });
        } else {
          card.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
          card.style.opacity = opacity;
        }
      });
    };

    // 左右按钮
    prevBtn?.addEventListener("click", () => {
      if (activeIndex > 0) {
        activeIndex--;
        updateDeck();
      } else {
        // 抖动提示已是第一张
        if (window.gsap) gsap.fromTo(prevBtn, { x: -4 }, { x: 0, duration: 0.25, ease: "bounce.out" });
      }
    });

    nextBtn?.addEventListener("click", () => {
      const cards = cardElements();
      if (activeIndex < cards.length - 1) {
        activeIndex++;
        updateDeck();
      } else {
        if (window.gsap) gsap.fromTo(nextBtn, { x: 4 }, { x: 0, duration: 0.25, ease: "bounce.out" });
      }
    });

    // 拖拽与滑动手势支持
    let startX = 0;
    let isDragging = false;

    deckTrack.addEventListener("mousedown", (e) => {
      if (e.target.closest("textarea, input, button")) return;
      startX = e.clientX;
      isDragging = true;
    });

    window.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      const dist = e.clientX - startX;
      if (dist > 45 && activeIndex > 0) {
        activeIndex--;
        updateDeck();
      } else if (dist < -45 && activeIndex < cardElements().length - 1) {
        activeIndex++;
        updateDeck();
      }
    });

    deckTrack.addEventListener("touchstart", (e) => {
      if (e.target.closest("textarea, input, button")) return;
      startX = e.touches[0].clientX;
    }, { passive: true });

    deckTrack.addEventListener("touchend", (e) => {
      const dist = e.changedTouches[0].clientX - startX;
      if (dist > 40 && activeIndex > 0) {
        activeIndex--;
        updateDeck();
      } else if (dist < -40 && activeIndex < cardElements().length - 1) {
        activeIndex++;
        updateDeck();
      }
    }, { passive: true });

    // 渲染平铺便签墙（使用统一心法列表）
    const renderWall = () => {
      if (!wallGrid) return;
      wallGrid.innerHTML = "";

      const all = getAllMindsets();
      all.forEach((m) => {
        const item = document.createElement("div");
        const isGuest = m.type === "guest";
        item.className = `mindset-wall-item hand-card ${m.fullWidth ? "full-width" : ""} ${isGuest ? "is-guest" : ""}`;
        item.dataset.id = m.id;

        const guestBadge = isGuest ? `<span class="guest-tag-badge">✦ 访客共创</span>` : "";
        const guestAuthor = isGuest && m.author ? `<span class="guest-author-tag">—— ${escapeHtml(m.author)}</span>` : "";
        const editBadge = m.isEdited ? `<span class="edited-dot" title="已编辑">✎</span>` : "";

        item.innerHTML = `
          ${guestBadge}${editBadge}
          <span class="mindset-num">${m.num}</span>
          <p class="mindset-quote">${m.html}</p>
          ${guestAuthor}
          <div class="card-owner-actions">
            <button type="button" class="btn-card-action btn-edit" data-edit-id="${m.id}" title="编辑此心法">✎</button>
            <button type="button" class="btn-card-action btn-del" data-del-id="${m.id}" title="删除此心法">×</button>
          </div>
        `;

        item.addEventListener("click", (e) => {
          if (e.target.closest(".btn-card-action")) {
            if (!isOwnerMode) return; // 只允许管理模式编辑/删除
            e.stopPropagation();
            const editBtn = e.target.closest(".btn-edit");
            const delBtn = e.target.closest(".btn-del");
            if (editBtn) openEditModal(editBtn.dataset.editId);
            if (delBtn) deleteMindset(delBtn.dataset.delId);
            return;
          }
          if (window.gsap) gsap.fromTo(item, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: "elastic.out(1.2, 0.4)" });
        });
        wallGrid.appendChild(item);
      });
    };

    // 释放时的苹果/纸屑粒子盛开动效
    const triggerReleaseExplosion = (sourceEl) => {
      const fallbackEl = $("#btn-release-mindset") || document.body;
      const rect = (sourceEl || fallbackEl).getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      for (let i = 0; i < 28; i++) {
        const p = document.createElement("span");
        p.className = `particle ${i % 2 === 0 ? "is-apple" : "is-sparkle"}`;
        p.style.position = "fixed";
        p.style.left = `${originX}px`;
        p.style.top = `${originY}px`;
        p.style.zIndex = "99999";
        p.style.pointerEvents = "none";
        document.body.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 120 + Math.random() * 260;

        if (window.gsap) {
          gsap.fromTo(p,
            { x: 0, y: 0, scale: 0.4, opacity: 1 },
            {
              x: Math.cos(angle) * velocity,
              y: Math.sin(angle) * velocity + 60,
              rotation: (Math.random() - 0.5) * 540,
              scale: 0.8 + Math.random() * 0.6,
              opacity: 0,
              duration: 1.1 + Math.random() * 0.5,
              ease: "power2.out",
              onComplete: () => p.remove()
            }
          );
        }
      }
    };

    // 切换为便签墙视图
    const switchToWall = (triggerParticles = false) => {
      currentView = "wall";
      renderWall();
      if (triggerParticles) triggerReleaseExplosion($("#btn-release-mindset"));

      if (window.gsap) {
        gsap.to(deckWrap, {
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          onComplete: () => {
            deckWrap.style.display = "none";
            wallWrap.style.display = "block";
            gsap.fromTo(wallWrap, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" });
            // 便签微弹入场
            gsap.fromTo($$(".mindset-wall-item", wallGrid),
              { scale: 0.9, opacity: 0, y: 15 },
              { scale: 1, opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
          }
        });
      } else {
        deckWrap.style.display = "none";
        wallWrap.style.display = "block";
      }

      if (toggleViewBtn) {
        toggleViewBtn.dataset.mode = "wall";
        $(".mode-icon", toggleViewBtn).textContent = "↺";
        $(".mode-text", toggleViewBtn).textContent = "弧形轮盘";
      }
    };

    // 切换为弧形轮盘视图
    const switchToDeck = () => {
      currentView = "deck";
      if (window.gsap) {
        gsap.to(wallWrap, {
          opacity: 0,
          y: 15,
          duration: 0.3,
          onComplete: () => {
            wallWrap.style.display = "none";
            deckWrap.style.display = "block";
            deckWrap.style.opacity = "1";
            updateDeck(true);
          }
        });
      } else {
        wallWrap.style.display = "none";
        deckWrap.style.display = "block";
        updateDeck(false);
      }

      if (toggleViewBtn) {
        toggleViewBtn.dataset.mode = "deck";
        $(".mode-icon", toggleViewBtn).textContent = "⊞";
        $(".mode-text", toggleViewBtn).textContent = "平铺便签墙";
      }
    };

    // 视图切换按钮
    toggleViewBtn?.addEventListener("click", () => {
      if (toggleViewBtn.dataset.mode === "deck") {
        switchToWall(false);
      } else {
        switchToDeck();
      }
    });

    collapseBtn?.addEventListener("click", switchToDeck);

    // 初始化：动态渲染轮盘卡片后启动弧形布局
    renderDeckCards();
    updateDeck(false);
    loadCloudMindsets(); // 异步拉取云端共享心法，加载完后刷新轮盘
    window.updateMindsetDeck = () => updateDeck(false);
    window.addEventListener("resize", () => updateDeck(false));
  };

  /* ============ 实习项目弧形轮盘（复用心法轮盘交互语言，无访客/管理功能） ============ */
  const initProjectDecks = () => {
    $$('[data-proj-deck]').forEach((wrap) => {
      const track = $('.proj-deck-track', wrap);
      const dotsContainer = $('[data-deck-dots]', wrap);
      const prevBtn = $('[data-deck-prev]', wrap);
      const nextBtn = $('[data-deck-next]', wrap);
      if (!track) return;

      const cards = $$('.proj-card', track);
      if (!cards.length) return;
      let active = 0;

      // 弧形轨道几何计算（与心法轮盘同款视觉语言）
      const update = (animate = true) => {
        if (active < 0) active = 0;
        if (active >= cards.length) active = cards.length - 1;

        if (dotsContainer) {
          dotsContainer.innerHTML = '';
          cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `deck-dot ${i === active ? 'active' : ''}`;
            dot.setAttribute('aria-label', `切换到项目 ${i + 1}`);
            dot.addEventListener('click', () => { active = i; update(); });
            dotsContainer.appendChild(dot);
          });
        }

        const isMobile = window.innerWidth <= 768;
        const xSpacing = isMobile ? 190 : 260;
        const yDropFactor = isMobile ? 16 : 20;
        const rotAngle = isMobile ? 4 : 5;

        cards.forEach((card, i) => {
          const diff = i - active;
          const absDiff = Math.abs(diff);
          const tx = diff * xSpacing;
          const ty = Math.pow(absDiff, 1.85) * yDropFactor;
          const rot = diff * rotAngle;
          const scale = Math.max(0.75, 1 - absDiff * 0.08);
          const opacity = absDiff > 2 ? 0 : Math.max(0.18, 1 - absDiff * 0.35);

          card.classList.toggle('is-active', diff === 0);
          card.style.zIndex = 50 - absDiff;

          if (window.gsap && animate) {
            gsap.to(card, { x: tx, y: ty, rotation: rot, scale, opacity, duration: 0.45, ease: 'power2.out' });
          } else {
            card.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`;
            card.style.opacity = opacity;
          }
        });
      };

      prevBtn?.addEventListener('click', () => {
        if (active > 0) { active--; update(); }
        else if (window.gsap) gsap.fromTo(prevBtn, { x: -4 }, { x: 0, duration: 0.25, ease: 'bounce.out' });
      });
      nextBtn?.addEventListener('click', () => {
        if (active < cards.length - 1) { active++; update(); }
        else if (window.gsap) gsap.fromTo(nextBtn, { x: 4 }, { x: 0, duration: 0.25, ease: 'bounce.out' });
      });

      // 拖拽与滑动切换
      let startX = 0;
      let isDragging = false;
      track.addEventListener('mousedown', (e) => {
        if (e.target.closest('a, button')) return;
        startX = e.clientX;
        isDragging = true;
      });
      window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const dist = e.clientX - startX;
        if (dist > 45 && active > 0) { active--; update(); }
        else if (dist < -45 && active < cards.length - 1) { active++; update(); }
      });
      track.addEventListener('touchstart', (e) => {
        if (e.target.closest('a, button')) return;
        startX = e.touches[0].clientX;
      }, { passive: true });
      track.addEventListener('touchend', (e) => {
        const dist = e.changedTouches[0].clientX - startX;
        if (dist > 40 && active > 0) { active--; update(); }
        else if (dist < -40 && active < cards.length - 1) { active++; update(); }
      }, { passive: true });

      // 点击非激活卡片直接切到该卡片
      cards.forEach((card, i) => {
        card.addEventListener('click', () => {
          if (i !== active) { active = i; update(); }
        });
      });

      update(false);
      window.addEventListener('resize', () => update(false));
      // Tab 面板切换后重新校准（面板首次显示前尺寸不可见）
      document.addEventListener('click', (e) => {
        if (e.target.closest('.cici-tab-btn')) setTimeout(() => update(false), 60);
      });
    });
  };

  /* ============ 第四幕 · 兴趣爱好：无限循环滚动画廊（marquee） ============ */
  const initMarquees = () => {
    $$("[data-marquee]").forEach((gallery) => {
      const track = $(".marquee-track", gallery);
      if (!track) return;

      // 将轨道包进遮罩层（左右渐虚），控制条放在遮罩外避免被淡化
      const maskBox = document.createElement("div");
      maskBox.className = "marquee-mask";
      gallery.insertBefore(maskBox, track);
      maskBox.appendChild(track);

      // 复制一份序列实现无缝循环（位移一半即归零重接）
      Array.from(track.children).forEach((node) => track.appendChild(node.cloneNode(true)));

      let offset = 0;
      let half = 0;          // 单组序列宽度（含间距）
      let inView = true;
      let paused = false;
      let userPaused = false; // 用户手动暂停
      let scrubbing = false;  // 正在拖拽进度条
      let lastP = -1;
      let dragging = false;
      let dragStartX = 0;
      let dragStartOffset = 0;
      let dragDx = 0;
      let lastTs = null;
      const speed = parseFloat(gallery.dataset.speed || "32"); // px/s，向左

      const measure = () => { half = track.scrollWidth / 2; };

      const wrap = () => {
        if (half <= 0) return;
        while (offset <= -half) offset += half;
        while (offset > 0) offset -= half;
      };

      const step = (ts) => {
        if (lastTs == null) lastTs = ts;
        const dt = Math.min((ts - lastTs) / 1000, 0.05);
        lastTs = ts;
        if (!paused && !dragging && !userPaused && !scrubbing && inView && half > 0) {
          offset -= speed * dt;
          wrap();
          track.style.transform = `translate3d(${offset}px, 0, 0)`;
        }
        // 同步进度条（拖拽进度条时由 scrubTo 直接控制，此处跳过）
        if (half > 0 && !scrubbing) {
          const p = (((-offset % half) + half) % half) / half;
          if (Math.abs(p - lastP) > 0.0005) { lastP = p; setProgress(p); }
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);

      // 尺寸测量：窗口 resize + 每张图片加载完成 + 兜底定时
      window.addEventListener("resize", measure);
      gallery.addEventListener("load", measure, true); // 捕获 img load
      window.addEventListener("load", measure);
      setTimeout(measure, 800);
      setTimeout(measure, 2500);

      // hover 暂停（触屏无 hover，不影响）
      gallery.addEventListener("mouseenter", () => { paused = true; });
      gallery.addEventListener("mouseleave", () => { paused = false; });

      // 拖拽（鼠标 + 触屏），松手后从当前位置恢复自动滚动
      const startDrag = (x) => {
        dragging = true;
        dragStartX = x;
        dragStartOffset = offset;
        dragDx = 0;
        gallery.classList.add("is-dragging");
      };
      const moveDrag = (x) => {
        if (!dragging) return;
        dragDx = x - dragStartX;
        offset = dragStartOffset + dragDx;
        wrap();
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
      };
      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        gallery.classList.remove("is-dragging");
        // 位移极小视为点击 → 打开 Lightbox 查看大图
        if (Math.abs(dragDx) < 6) {
          const fig = document.elementFromPoint(lastPointer.x, lastPointer.y)?.closest(".marquee-item");
          const img = fig?.querySelector("img");
          if (img) {
            openLightbox(`<img src="${img.src}" alt="" style="max-width:88vw;max-height:82vh;width:auto;border:3px solid var(--bg)">`);
          }
        }
      };
      const lastPointer = { x: 0, y: 0 };

      gallery.addEventListener("mousedown", (e) => { lastPointer = { x: e.clientX, y: e.clientY }; startDrag(e.clientX); });
      window.addEventListener("mousemove", (e) => moveDrag(e.clientX));
      window.addEventListener("mouseup", endDrag);

      gallery.addEventListener("touchstart", (e) => { startDrag(e.touches[0].clientX); }, { passive: true });
      gallery.addEventListener("touchmove", (e) => { moveDrag(e.touches[0].clientX); }, { passive: true });
      gallery.addEventListener("touchend", (e) => {
        const t = e.changedTouches[0];
        lastPointer = { x: t.clientX, y: t.clientY };
        endDrag();
      }, { passive: true });

      // 拖拽期间阻止图片原生拖拽与链接跳转
      gallery.addEventListener("dragstart", (e) => e.preventDefault());

      // 滚出视口自动暂停，省 CPU；回来继续
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
          entries.forEach((en) => { inView = en.isIntersecting; });
        }, { threshold: 0.05 }).observe(gallery);
      }

      // 减少动态偏好：降级为静态横向滚动
      if (reducedMotion) {
        gallery.style.overflowX = "auto";
        track.style.transform = "none";
      }

      /* ---- 右下角控制条：播放/暂停 + 进度拖拽 ---- */
      const ctrl = document.createElement("div");
      ctrl.className = "marquee-ctrl";
      ctrl.innerHTML = `
        <button class="mq-toggle" type="button" aria-label="暂停滚动">❚❚</button>
        <div class="mq-progress" role="slider" aria-label="浏览进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span class="mq-bar"></span><span class="mq-thumb"></span>
        </div>`;
      gallery.appendChild(ctrl);

      const toggleBtn = $(".mq-toggle", ctrl);
      const progressEl = $(".mq-progress", ctrl);
      const barEl = $(".mq-bar", ctrl);
      const thumbEl = $(".mq-thumb", ctrl);

      const setProgress = (p) => {
        p = Math.min(Math.max(p, 0), 1);
        barEl.style.transform = `translateY(-50%) scaleX(${p})`;
        thumbEl.style.left = `${p * 100}%`;
        progressEl.setAttribute("aria-valuenow", String(Math.round(p * 100)));
      };

      // 播放 / 暂停切换
      toggleBtn.addEventListener("click", () => {
        userPaused = !userPaused;
        toggleBtn.textContent = userPaused ? "▶" : "❚❚";
        toggleBtn.setAttribute("aria-label", userPaused ? "播放滚动" : "暂停滚动");
      });

      // 控制条上的按下不触发光画廊整体的拖拽
      ctrl.addEventListener("mousedown", (e) => e.stopPropagation());
      ctrl.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });

      // 拖拽进度条：定位到对应画面（无限循环内的百分比）
      const scrubTo = (clientX) => {
        const r = progressEl.getBoundingClientRect();
        const p = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
        setProgress(p);
        offset = -(half * p);
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
      };
      progressEl.addEventListener("pointerdown", (e) => {
        if (reducedMotion || half <= 0) return;
        scrubbing = true;
        progressEl.setPointerCapture?.(e.pointerId);
        scrubTo(e.clientX);
      });
      progressEl.addEventListener("pointermove", (e) => { if (scrubbing) scrubTo(e.clientX); });
      ["pointerup", "pointercancel"].forEach((ev) =>
        progressEl.addEventListener(ev, () => { scrubbing = false; })
      );

      // 静态横滚模式下控制条无意义，移除
      if (reducedMotion) ctrl.remove();
    });
  };

  // 辅助函数
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ============ 第四幕 · 人像翻页影集（快门下的人像） ============ */
  // 12 组跨页布局：w=照片宽(页面宽%)、x/y=位置(%)、r=旋转角，按每组张数与横竖版散排
  const PB_IMG = "assets/img/hobby/portrait/";
  const PB_SPREADS = [
    { tag: "人像", place: "乌鲁木齐植物园",
      left:  [],
      right: [{ src: "wulumqi-1.jpg", w: 66, x: 5,  y: 4 }, { src: "wulumqi-3.jpg", w: 40, x: 58, y: 14 }, { src: "wulumqi-2.jpg", w: 74, x: 10, y: 52 }],
      label: { page: "right", x: 8, y: 92 } },
    { tag: "人像", place: "成都陆家桥",
      left:  [{ src: "lujiaqiao-1.jpg", w: 80, x: 10, y: 14, r: -2 }],
      right: [{ src: "lujiaqiao-2.jpg", w: 80, x: 10, y: 40, r: 2.5 }],
      label: { page: "right", x: 12, y: 12 } },
    { tag: "人像", place: "川大 · 江安校区",
      left:  [{ src: "jiangan-1.jpg", w: 78, x: 11, y: 12, r: -1.5 }],
      right: [{ src: "jiangan-2.jpg", w: 56, x: 26, y: 12, r: 2 }],
      label: { page: "left",  x: 12, y: 68 } },
    { tag: "人像", place: "江安 · 不高山",
      left:  [{ src: "bugaoshan-1.jpg", w: 58, x: 10, y: 10, r: -2 }],
      right: [{ src: "bugaoshan-2.jpg", w: 58, x: 30, y: 24, r: 2.5 }],
      label: { page: "left",  x: 12, y: 84 } },
    { tag: "人像", place: "天台",
      left:  [{ src: "rooftop-1.jpg", w: 56, x: 22, y: 8,  r: 2 }],
      right: [{ src: "rooftop-2.jpg", w: 78, x: 12, y: 44, r: -2.5 }],
      label: { page: "right", x: 14, y: 12 } },
    { tag: "人像", place: "川大 · 望江校区",
      left:  [{ src: "wangjiang-1.jpg", w: 54, x: 8,  y: 7,  r: -2 }, { src: "wangjiang-2.jpg", w: 70, x: 24, y: 60, r: 2 }],
      right: [{ src: "wangjiang-3.jpg", w: 82, x: 9,  y: 22, r: -1.5 }],
      label: { page: "right", x: 12, y: 76 } },
    { tag: "人像", place: "玉林路",
      left:  [{ src: "yulinlu-1.jpg", w: 58, x: 14, y: 10, r: 1.5 }],
      right: [{ src: "yulinlu-2.jpg", w: 76, x: 12, y: 48, r: -2.5 }],
      label: { page: "left",  x: 12, y: 82 } },
    { tag: "双人", place: "兰桂坊",
      left:  [{ src: "langui-1.jpg", w: 60, x: 32, y: 12, r: 2 }],
      right: [{ src: "langui-2.jpg", w: 60, x: 10, y: 18, r: -2 }],
      label: { page: "left",  x: 8,  y: 84 } },
    { tag: "双人", place: "望江楼公园",
      left:  [{ src: "wangjianglou-1.jpg", w: 54, x: 10, y: 7,  r: -1.5 }, { src: "wangjianglou-2.jpg", w: 70, x: 24, y: 62, r: 2 }],
      right: [{ src: "wangjianglou-3.jpg", w: 84, x: 8,  y: 20, r: -2 }],
      label: { page: "right", x: 12, y: 74 } },
    { tag: "情侣", place: "成都植物园",
      left:  [{ src: "zhiwuyuan-1.jpg", w: 82, x: 9, y: 10, r: 2 }],
      right: [{ src: "zhiwuyuan-2.jpg", w: 82, x: 9, y: 38, r: -1.5 }],
      label: { page: "right", x: 12, y: 14 } },
    { tag: "情侣", place: "中河湿地公园",
      left:  [{ src: "zhonghe-1.jpg", w: 52, x: 12, y: 8,  r: -2 }],
      right: [{ src: "zhonghe-2.jpg", w: 52, x: 34, y: 20, r: 2.5 }],
      label: { page: "left",  x: 12, y: 86 } },
    { tag: "汉服", place: "三元油菜花田",
      left:  [{ src: "hanfu-1.jpg", w: 44, x: 6,  y: 8 }, { src: "hanfu-2.jpg", w: 44, x: 52, y: 14 }],
      right: [],
      label: { page: "left",  x: 12, y: 84 } }
  ];

  const initPortraitAlbum = () => {
    const entryBtn = $("#album-closed");
    const overlay = $("#portrait-book");
    const book = $("#pb-book");
    if (!entryBtn || !overlay || !book) return;

    const prevBtn = $("#pb-prev");
    const nextBtn = $("#pb-next");
    const countEl = $("#pb-count");
    const closeBtn = $(".pb-close", overlay);
    const entryBook = $(".album-book", entryBtn);

    /* ---- 无人打开时交替「大幅晃动 / 翻开封面偷看」提醒（打开过一次后永久停止） ---- */
    let hintRound = 0;
    const hintTimer = setInterval(() => {
      if (!overlay.hidden) return; // 影集打开中不提醒
      hintRound++;
      const cls = hintRound % 2 === 1 ? "is-shaking" : "is-peeking";
      entryBtn.classList.add(cls);
      setTimeout(() => entryBtn.classList.remove(cls), 1600);
    }, 4500);
    entryBtn.addEventListener("click", () => clearInterval(hintTimer), { once: true });

    /* ---- 构建书页 ---- */
    // 页面 HTML：照片拼贴 + 组名标签
    const photosHTML = (items) => items.map((it) => `
      <figure class="pb-photo" style="--w:${it.w}%;--x:${it.x}%;--y:${it.y}%">
        <img src="${PB_IMG}${it.src}" alt="${it.src.replace(/-\d+\.jpg$/, "")}" loading="lazy" decoding="async">
      </figure>`).join("");
    // 地点名：宋体无框，只出现在 label 指定的页面上
    const placeHTML = (s, side) => {
      const l = s.label;
      if (!l || l.page !== side) return "";
      return `<div class="pb-place" style="--lx:${l.x}%;--ly:${l.y}%">${s.place}</div>`;
    };

    // 叶子结构：封面叶(正面=封面/反面=第1组左页) + N 张内叶(正面=上组右页/反面=下组左页)
    const N = PB_SPREADS.length;
    const makeLeaf = (frontHTML, backHTML, extraCls = "") => {
      const leaf = document.createElement("div");
      leaf.className = `pb-leaf ${extraCls}`;
      leaf.innerHTML = `
        <div class="pb-face pb-front">${frontHTML}<span class="pb-turn-shade"></span></div>
        <div class="pb-face pb-back">${backHTML}<span class="pb-turn-shade"></span></div>`;
      return leaf;
    };
    const pageFace = (cls, inner) => `<div class="pb-face ${cls}">${inner}</div>`;

    // 封面叶：正面红壳封面（同入口相册）/ 反面扉页（影集总标题）
    book.appendChild(makeLeaf(
      pageFace("pb-cover-front", `
        <div class="pb-cover-box">
          <span class="pb-cover-title-cn">YUNLlly 人像影集</span>
        </div>`),
      pageFace("pb-left pb-titlepage", `
        <div class="pb-flyleaf-title">
          <b>快门下的他们</b>
          <span></span>
          <i>YUNLlly · 人像摄影集</i>
          <em>12 GROUPS · 27 PHOTOS</em>
        </div>`),
      "pb-cover-leaf"
    ));
    // 内叶 1..N（最后一跨页右页为封底收尾文案）
    for (let i = 1; i <= N; i++) {
      const prev = PB_SPREADS[i - 1];
      const next = i < N ? PB_SPREADS[i] : null;
      const front = i === N
        ? pageFace("pb-right pb-endpage", `
            <div class="pb-closing">
              <b>快门不停，故事未完</b>
              <p>谢谢你看完这本影集——<br>每一张笑脸，都是我按下快门时的心动。</p>
              <i>期待在下一个取景框里，与你相遇</i>
            </div>`)
        : pageFace("pb-right", placeHTML(prev, "right") + photosHTML(prev.right));
      const back = next
        ? pageFace("pb-left", placeHTML(next, "left") + photosHTML(next.left))
        : pageFace("pb-left", "");
      book.appendChild(makeLeaf(front, back));
    }

    // 照片显影：加载完成后淡入
    $$("img", book).forEach((img) => {
      if (img.complete && img.naturalWidth > 0) img.classList.add("is-loaded");
      else img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
    });

    // 翻页提示角标（挂在最上层叶子之上，随书显示）
    const hintR = document.createElement("span");
    hintR.className = "pb-corner-hint pb-hint-right";
    const hintL = document.createElement("span");
    hintL.className = "pb-corner-hint pb-hint-left";
    book.appendChild(hintR);
    book.appendChild(hintL);

    const leaves = $$(".pb-leaf", book);
    const TOTAL = leaves.length; // N + 1

    /* ---- 翻页状态机 ---- */
    let flipped = 0;        // 已翻过的叶子数：0=封面合上
    let bookLocked = false; // 打开/关闭动画期间锁交互

    const updateZ = () => {
      leaves.forEach((leaf, i) => {
        if (leaf.classList.contains("is-turning")) return;
        leaf.style.zIndex = i < flipped ? i + 2 : TOTAL - i + 2;
      });
      hintR.style.zIndex = flipped >= TOTAL ? 0 : TOTAL + 5;
      hintL.style.zIndex = flipped === 0 ? 0 : TOTAL + 5;
    };
    const setFlipState = () => leaves.forEach((leaf, i) => leaf.classList.toggle("is-flipped", i < flipped));

    const updatePager = () => {
      if (countEl) {
        countEl.textContent = flipped === 0 ? "封面" : flipped >= TOTAL ? "封底" : `${flipped} / ${N}`;
      }
      if (prevBtn) prevBtn.disabled = flipped <= 1;
      if (nextBtn) nextBtn.disabled = flipped >= TOTAL;
    };

    const go = (dir) => {
      if (bookLocked) return;
      const target = Math.min(Math.max(flipped + dir, 0), TOTAL);
      if (target === flipped) return;
      const idx = dir > 0 ? flipped : flipped - 1;
      const leaf = leaves[idx];
      leaf.classList.add("is-turning");
      // 翻动中的叶子始终压在最上层
      leaf.style.zIndex = TOTAL + 20;
      leaf.classList.toggle("is-flipped", dir > 0);
      flipped = target;
      setTimeout(() => {
        leaf.classList.remove("is-turning");
        updateZ();
      }, 1080);
      updatePager();
    };

    /* ---- 打开 / 关闭（FLIP 放大展开） ---- */
    const openBook = () => {
      if (bookLocked) return;
      bookLocked = true;
      flipped = 0;
      setFlipState();
      updateZ();
      updatePager();

      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();

      const from = entryBook.getBoundingClientRect();
      requestAnimationFrame(() => {
        const to = book.getBoundingClientRect();
        const scale = Math.max(0.05, Math.min(from.width / to.width, from.height / to.height));
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        const dy = from.top + from.height / 2 - (to.top + to.height / 2);

        if (reducedMotion) {
          bookLocked = false;
          return;
        }
        book.style.transition = "none";
        book.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        book.style.opacity = "0";
        requestAnimationFrame(() => {
          book.style.transition = "";
          book.style.transform = "";
          book.style.opacity = "1";
          // 书落定后翻开封面
          setTimeout(() => {
            bookLocked = false;
            go(1);
          }, 680);
        });
      });
    };

    const closeBook = () => {
      if (bookLocked || overlay.hidden) return;
      bookLocked = true;
      // 全部叶子快速合回
      leaves.forEach((leaf) => leaf.classList.add("is-turning"));
      flipped = 0;
      setFlipState();
      updatePager();

      setTimeout(() => {
        const from = book.getBoundingClientRect();
        const to = entryBook.getBoundingClientRect();
        const scale = Math.max(0.05, Math.min(to.width / from.width, to.height / from.height));
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);

        if (reducedMotion) {
          overlay.hidden = true;
          document.body.style.overflow = "";
          if (lenis) lenis.start();
          leaves.forEach((leaf) => leaf.classList.remove("is-turning"));
          updateZ();
          bookLocked = false;
          return;
        }
        book.style.transition = "transform .55s cubic-bezier(.55,.06,.28,.99), opacity .5s ease .12s";
        book.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        book.style.opacity = "0";
        setTimeout(() => {
          overlay.hidden = true;
          book.style.cssText = "";
          leaves.forEach((leaf) => leaf.classList.remove("is-turning"));
          updateZ();
          document.body.style.overflow = "";
          if (lenis) lenis.start();
          bookLocked = false;
        }, 620);
      }, flipped === 0 ? 350 : 900);
    };

    /* ---- 事件绑定 ---- */
    // 相册在画廊内部：按下时不触发照片流拖拽
    entryBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    entryBtn.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    entryBtn.addEventListener("click", openBook);
    closeBtn?.addEventListener("click", closeBook);
    $(".pb-backdrop", overlay)?.addEventListener("click", closeBook);

    // 点击照片 → 全屏灯箱（底部显示地点）；点击书体其余区域 → 翻页
    book.addEventListener("click", (e) => {
      if (bookLocked) return;
      const photo = e.target.closest(".pb-photo");
      if (photo) {
        const face = photo.closest(".pb-face");
        const place = face ? (face.querySelector(".pb-place")?.textContent || "") : "";
        const src = photo.querySelector("img")?.src;
        if (src) openLightbox(`<figure class="lb-single"><img src="${src}" alt=""><figcaption class="lb-cap">${place}</figcaption></figure>`);
        return;
      }
      const r = book.getBoundingClientRect();
      const onRight = e.clientX - r.left > r.width / 2;
      go(onRight ? 1 : -1);
    });

    // 移动端左右滑动翻页
    let pbTouchX = 0;
    book.addEventListener("touchstart", (e) => { pbTouchX = e.touches[0].clientX; }, { passive: true });
    book.addEventListener("touchend", (e) => {
      if (bookLocked) return;
      const dx = e.changedTouches[0].clientX - pbTouchX;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    }, { passive: true });
    prevBtn?.addEventListener("click", (e) => { e.stopPropagation(); go(-1); });
    nextBtn?.addEventListener("click", (e) => { e.stopPropagation(); go(1); });

    // 键盘：Esc 合上，←→ 翻页
    document.addEventListener("keydown", (e) => {
      if (overlay.hidden) return;
      if (e.key === "Escape") closeBook();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    });

    updatePager();
    updateZ();
  };

  function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // 初始化
  initReveals();
  initMindsetArcSystem();
  initProjectDecks();
  initMarquees();
  initPortraitAlbum();
  updateAltimeter();
})();
