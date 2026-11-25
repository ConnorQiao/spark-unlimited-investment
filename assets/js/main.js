/* Spark Unlimited Investment — 页面交互
 * 目录：工具 / 语言 / 标题拆行 / 入场 / 首屏射线 / 导航 / 投资方向 /
 *      团队照片 / 留资表单 / 启动
 */
(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  var doc = document, root = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var compact = window.matchMedia('(max-width: 900px)');
  var phone = window.matchMedia('(max-width: 640px)');   // 与样式表里「手机」一段的断点一致
  var DICT = window.SPARK_I18N || {}, CFG = window.SPARK_CONFIG || {};

  /* ---------- 语言 ---------- */
  var STORE = 'spark-lang';
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
    try { localStorage.setItem(STORE, next); } catch (e) {}
    if (reduce) { applyLang(); return; }
    root.classList.add('is-switching');
    setTimeout(function () {
      applyLang();
      requestAnimationFrame(function () { root.classList.remove('is-switching'); });
    }, 230);
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
    var els = $$('.rv, .rule[data-rule], [data-lines], .alloc__ray');
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

  /* ---------- 首屏射线 ----------
   * 从标题末尾的圆点出发，穿过指针所在的方向，一直延伸到画面之外。
   * 没有指针时停在右上方，并有极缓慢的摆动。
   */
  var hero = $('.hero'), rayLine = $('.hero__ray line');
  var ray = { x: 0, y: 0, a: -0.6, target: null, raf: 0, inView: true };
  var MIN_A = -1.36, MAX_A = 0.1;

  function rayOrigin() {
    var dot = $('.hero__title .dot');
    if (!dot || !hero) return false;
    var hr = hero.getBoundingClientRect(), dr = dot.getBoundingClientRect();
    ray.x = dr.left + dr.width / 2 - hr.left;
    ray.y = dr.top + dr.height / 2 - hr.top;
    ray.w = hr.width; ray.h = hr.height;
    return true;
  }
  function rayRest() {
    return clamp(Math.atan2(ray.h * (ray.w < 760 ? 0.2 : 0.16) - ray.y, ray.w * 1.02 - ray.x), MIN_A, MAX_A);
  }
  function rayDraw() {
    var len = 6000;
    rayLine.setAttribute('x1', ray.x.toFixed(1));
    rayLine.setAttribute('y1', ray.y.toFixed(1));
    rayLine.setAttribute('x2', (ray.x + Math.cos(ray.a) * len).toFixed(1));
    rayLine.setAttribute('y2', (ray.y + Math.sin(ray.a) * len).toFixed(1));
  }
  function rayTick(now) {
    ray.raf = requestAnimationFrame(rayTick);
    if (!rayOrigin()) return;
    var goal = ray.target !== null ? ray.target : rayRest() + Math.sin(now / 4200) * 0.018;
    ray.a += (goal - ray.a) * 0.07;
    rayDraw();
  }
  function raySync() {
    var on = ray.inView && !doc.hidden && !reduce;
    if (on && !ray.raf) ray.raf = requestAnimationFrame(rayTick);
    if (!on && ray.raf) { cancelAnimationFrame(ray.raf); ray.raf = 0; }
  }
  function rayStart() {
    if (!hero || !rayLine) return;
    if (rayOrigin()) { ray.a = rayRest(); rayDraw(); }
    if (reduce) { window.addEventListener('resize', function () { if (rayOrigin()) { ray.a = rayRest(); rayDraw(); } }); return; }
    if (finePointer) {
      hero.addEventListener('pointermove', function (e) {
        var hr = hero.getBoundingClientRect();
        var dx = e.clientX - hr.left - ray.x, dy = e.clientY - hr.top - ray.y;
        if (dx * dx + dy * dy < 1600) return;                       // 太靠近圆点时不改方向
        ray.target = clamp(Math.atan2(dy, Math.abs(dx)), MIN_A, MAX_A); // 指针在左侧时取镜像，方向保持连续
      }, { passive: true });
      hero.addEventListener('pointerleave', function () { ray.target = null; });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { ray.inView = entries[0].isIntersecting; raySync(); }).observe(hero);
    }
    doc.addEventListener('visibilitychange', raySync);
    raySync();
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

  /* ---------- 信条与团队：手机上点一行展开说明 ----------
   * 说明文字包在 .fold 里。宽屏上一直显示；手机上默认收起，
   * 这里给每一行补一个加号按钮（键盘与读屏可用），点整行也能展开。
   */
  $$('.creed__row, .roster__row').forEach(function (row, i) {
    var title = $('h4', row), fold = $('.fold', row);
    if (!title || !fold) return;
    title.id = title.id || 'fold-title-' + i;
    fold.id = fold.id || 'fold-' + i;
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'row-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-labelledby', title.id);
    btn.setAttribute('aria-controls', fold.id);
    row.appendChild(btn);
    row.addEventListener('click', function () {
      if (!phone.matches) return;
      var open = !row.classList.contains('is-open');
      row.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- 团队照片 ----------
   * 行上写了 data-photo 时，指针悬停会出现跟随的照片。
   */
  var portrait = $('.portrait');
  if (portrait && finePointer && !reduce) {
    $$('.roster__row').forEach(function (row) {
      var move = function (e) {
        portrait.style.setProperty('--x', (e.clientX + 28) + 'px');
        portrait.style.setProperty('--y', (e.clientY - 150) + 'px');
      };
      row.addEventListener('pointerenter', function (e) {
        var src = row.getAttribute('data-photo');
        if (!src) return;
        portrait.style.backgroundImage = 'url("' + src.replace(/"/g, '%22') + '")';
        move(e);
        portrait.classList.add('is-on');
      });
      row.addEventListener('pointermove', move, { passive: true });
      row.addEventListener('pointerleave', function () { portrait.classList.remove('is-on'); });
    });
  }

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
    rayStart();
  }
  var fontReady = doc.fonts && doc.fonts.load ? doc.fonts.load('300 1em "Spark Sans"', '让星火 Aa') : Promise.resolve();
  var cap = new Promise(function (resolve) { setTimeout(resolve, reduce ? 0 : 1600); });
  Promise.race([fontReady, cap]).then(start, start);
})();
