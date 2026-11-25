/* Spark Unlimited Investment — 页面交互
 * 目录：工具 / 字体 / 语言 / 标题拆行 / 入场 / 首屏插图 / 导航 / 投资方向 / 留资表单 / 启动
 */
(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  var doc = document, root = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var wait = function (ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var compact = window.matchMedia('(max-width: 900px)');
  var phone = window.matchMedia('(max-width: 640px)');   // 与样式表里「手机」一段的断点一致
  var DICT = window.SPARK_I18N || {}, CFG = window.SPARK_CONFIG || {};

  /* ---------- 字体 ----------
   * 中文字体表（#cjk-font）是异步加载的。等它到了，再按需加载某段中文用到的字形。 */
  var cjkLink = $('#cjk-font');
  var cjkCss = new Promise(function (resolve) {
    if (!cjkLink || cjkLink.sheet) return resolve();
    cjkLink.addEventListener('load', resolve);
    cjkLink.addEventListener('error', resolve);
  }).then(function () { if (cjkLink) cjkLink.media = 'all'; });

  function loadCjk(text) {
    if (!doc.fonts || !doc.fonts.load) return Promise.resolve();
    return cjkCss.then(function () { return doc.fonts.load('300 1em "Noto Sans SC Variable"', text); });
  }
  var plain = function (html) { return String(html || '').replace(/<[^>]*>/g, ''); };

  /* ---------- 语言 ----------
   * 进来总是英文，只有地址里写了 ?lang=zh 才直接显示中文（由 index.html 头部的脚本决定）。
   * 页面上切换语言只在本次浏览有效，不写入本地存储。 */
  var lang = root.lang && root.lang.toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  if (!DICT[lang]) lang = 'en';

  function t(key) {
    var o = DICT[lang], parts = key.split('.');
    for (var i = 0; i < parts.length; i++) { if (o == null) return null; o = o[parts[i]]; }
    return o;
  }

  function applyLang() {
    var d = DICT[lang];
    if (!d) return;
    root.lang = d.htmlLang;
    doc.title = d.meta.title;
    var set = function (sel, v) { var m = $(sel); if (m) m.setAttribute('content', v); };
    set('meta[name="description"]', d.meta.desc);
    set('meta[property="og:title"]', d.meta.title);
    set('meta[property="og:description"]', d.meta.desc);

    $$('[data-i18n]').forEach(function (el) { var v = t(el.getAttribute('data-i18n')); if (typeof v === 'string') el.textContent = v; });
    $$('[data-i18n-html]').forEach(function (el) { var v = t(el.getAttribute('data-i18n-html')); if (typeof v === 'string') el.innerHTML = v; });
    $$('[data-i18n-list]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-list'));
      if (Array.isArray(v)) el.innerHTML = v.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var i = pair.indexOf(':'); if (i < 0) return;
        var v = t(pair.slice(i + 1).trim()); if (typeof v === 'string') el.setAttribute(pair.slice(0, i).trim(), v);
      });
    });
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    $$('[data-lines]').forEach(splitLines);
    clearFormErrors();
    onScroll();
  }

  function setLang(next) {
    if (next === lang || !DICT[next]) return;
    lang = next;
    if (reduce) { applyLang(); return; }
    root.classList.add('is-switching');
    // 切到中文时，先把首屏和导航要用的字形拿到，最多等 0.7 秒，避免淡入后再换字形
    var glyphs = next === 'zh'
      ? Promise.race([loadCjk(plain(DICT.zh.hero.title) + plain(DICT.zh.hero.lede) + JSON.stringify(DICT.zh.nav)), wait(700)])
      : null;
    Promise.all([wait(230), glyphs]).then(function () {
      applyLang();
      requestAnimationFrame(function () { root.classList.remove('is-switching'); });
    });
  }

  /* ---------- 标题拆行 ----------
   * 按 <br> 把标题拆成行，每行从遮罩下方升起；
   * 带 data-dot 的标题在最后一行末尾接上圆点，代替句号。
   */
  function splitLines(el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    var dot = el.hasAttribute('data-dot') ? '<i class="dot" aria-hidden="true"></i>' : '';
    el.innerHTML = parts.map(function (p, i) {
      return '<span class="l"><span class="l__i" style="--i:' + i + '">' + p + (i === parts.length - 1 ? dot : '') + '</span></span>';
    }).join('');
    el.style.setProperty('--n', parts.length);
  }

  /* ---------- 入场 ---------- */
  function observeReveals() {
    var els = $$('.rv, .rule[data-rule], [data-lines], .alloc__ray, [data-art]');
    var show = function (el) { el.classList.add('is-in'); };
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) {
      // 首屏内容在开场时直接出现，不等滚动判定
      if (el.closest('.hero')) show(el); else io.observe(el);
    });
  }

  /* ---------- 首屏插图 ----------
   * 射线组随指针轻微转动（最多 3 度），只在插图自己的区域里动，不会扫过文字。
   * 首屏离开视野时暂停插图里的循环动画。
   */
  var hero = $('.hero');
  function heroArt() {
    if (!hero) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { hero.classList.toggle('is-off', !entries[0].isIntersecting); }).observe(hero);
    }
    var tilt = $('.hero__art [data-tilt]');
    if (!tilt || reduce || !finePointer) return;
    var cur = 0, goal = 0, raf = 0;
    var tick = function () {
      cur += (goal - cur) * 0.06;
      tilt.style.setProperty('--tilt', cur.toFixed(3));
      raf = Math.abs(goal - cur) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    var aim = function (v) { goal = v; if (!raf) raf = requestAnimationFrame(tick); };
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      aim(clamp((nx + ny) * 4, -3, 3));   // 指针在右下时扇面往下压，在左上时往上抬
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { aim(0); });
  }

  /* ---------- 导航 ---------- */
  var nav = $('#nav'), dark = $('#dark'), lastY = window.pageYOffset, ticking = false;

  function onScroll() {
    if (!nav) return;
    var y = window.pageYOffset, vh = window.innerHeight, open = root.classList.contains('menu-open');
    nav.classList.toggle('is-scrolled', y > 8);
    if (!open) {
      if (y > lastY + 6 && y > vh * 0.5) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 80) nav.classList.remove('is-hidden');
    }
    lastY = y;
    // 导航压在深色区域上时切换成深色
    if (dark) {
      var r = dark.getBoundingClientRect(), mid = nav.offsetHeight / 2;
      nav.classList.toggle('dark', !open && r.top <= mid && r.bottom > mid);
    }
  }
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        $$('[data-nav]').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-nav') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'about', 'mission', 'focus', 'team', 'contact'].forEach(function (id) { var s = doc.getElementById(id); if (s) so.observe(s); });
  }

  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });

  var menuBtn = $('.menu-btn'), menu = $('#menu');
  function toggleMenu(open) {
    open = typeof open === 'boolean' ? open : !root.classList.contains('menu-open');
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    doc.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('is-hidden');
    onScroll();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { toggleMenu(); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { toggleMenu(false); menuBtn.focus(); } });
    var onMq = function () { if (!compact.matches && root.classList.contains('menu-open')) toggleMenu(false); };
    if (compact.addEventListener) compact.addEventListener('change', onMq); else if (compact.addListener) compact.addListener(onMq);
  }

  /* ---------- 投资方向：展开与收起 ----------
   * 宽屏上第一行默认展开；手机上全部收起，避免一进来就是一大段文字。
   */
  $$('.alloc__row').forEach(function (row) {
    var head = $('.alloc__head', row);
    var set = function (open) {
      row.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
    };
    if (phone.matches) set(false);
    head.addEventListener('click', function () { set(!row.classList.contains('is-open')); });
  });

  /* ---------- 留资表单 ---------- */
  var form = $('#lead-form'), done = $('.done');

  function validate(input) {
    var v = input.value.trim(), msg = '';
    if (input.required && !v) msg = t('contact.form.errRequired');
    else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = t('contact.form.errEmail');
    else if (input.name === 'message' && v && Array.from(v).length < 6) msg = t('contact.form.errShort');
    var f = input.closest('.field');
    f.classList.toggle('is-invalid', !!msg);
    $('.field__err', f).textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  }
  function clearFormErrors() {
    if (!form) return;
    $$('.field', form).forEach(function (f) { f.classList.remove('is-invalid'); $('.field__err', f).textContent = ''; });
    $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
    $('.form__status', form).textContent = '';
  }
  function send(data) {
    if (!CFG.formEndpoint) {
      // 演示模式：没有配置提交地址，不会真的发出
      return new Promise(function (resolve) { setTimeout(function () { resolve({ demo: true }); }, 900); });
    }
    return fetch(CFG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return { demo: false };
    });
  }

  if (form && done) {
    var inputs = $$('.field input, .field textarea', form);
    var submit = $('.btn', form), label = $('.btn__label', submit), status = $('.form__status', form);

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { if (input.value.trim() || input.closest('.field').classList.contains('is-invalid')) validate(input); });
      input.addEventListener('input', function () { if (input.closest('.field').classList.contains('is-invalid')) validate(input); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      var bad = inputs.filter(function (input) { return !validate(input); });
      if (bad.length) { bad[0].focus(); return; }

      var fd = new FormData(form);
      submit.classList.add('is-loading');
      label.textContent = t('contact.form.sending');

      var job = fd.get('website')   // 蜜罐被填写，判定为机器人：不发送，直接显示成功
        ? Promise.resolve({ demo: false })
        : send({
            name: fd.get('name').trim(), company: fd.get('company').trim(), email: fd.get('email').trim(),
            phone: fd.get('phone').trim(), role: fd.get('role'), message: fd.get('message').trim(),
            lang: lang, page: location.href, submittedAt: new Date().toISOString()
          });

      job.then(function (res) {
        form.hidden = true; done.hidden = false;
        $('.done__demo', done).hidden = !res.demo;
        $('.done__title', done).focus({ preventScroll: true });
      }).catch(function () {
        status.textContent = t('contact.form.errSend');
      }).then(function () {
        submit.classList.remove('is-loading');
        label.textContent = t('contact.form.submit');
      });
    });

    $('.done__again', done).addEventListener('click', function () {
      form.reset(); clearFormErrors();
      done.hidden = true; form.hidden = false;
      inputs[0].focus({ preventScroll: true });
    });
  }

  /* ---------- 启动 ---------- */
  var year = $('#year'); if (year) year.textContent = new Date().getFullYear();
  if (CFG.emails) {
    $$('[data-mail]').forEach(function (a) {
      var addr = CFG.emails[a.getAttribute('data-mail')];
      if (addr) { a.textContent = addr; a.href = 'mailto:' + addr; }
    });
  }

  applyLang();

  // 等标题字体就绪再开场，避免字形替换时跳动；最多等 1.6 秒
  var started = false;
  function start() {
    if (started) return; started = true;
    doc.body.classList.add('is-live');
    observeReveals();
    heroArt();
  }
  var titleText = (($('#hero-title') || {}).textContent || '') + 'Aa';
  var fontReady = doc.fonts && doc.fonts.load
    ? Promise.all([
        doc.fonts.load('300 1em "Spark Sans"', 'Aa'),
        lang === 'zh' ? loadCjk(titleText) : null
      ])
    : Promise.resolve();
  Promise.race([fontReady, wait(reduce ? 0 : 1600)]).then(start, start);
})();
