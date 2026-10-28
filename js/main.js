(() => {
  'use strict';

  const PRODUCTS = window.MONARCA_PRODUCTS;
  const CATEGORIES = window.MONARCA_CATEGORIES;
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const money = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const imgSrc = (name) => `assets/products/${name}.webp`;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  /* ---------- Сцена: фото Парижа → сборка заколки по скроллу ---------- */

  const FRAME_COUNT = 193;
  // Переход «Париж → ателье» растянут примерно на четверть сцены и идёт в три шага:
  // текст уходит → фото растворяется в студийный фон → проявляются детали заколки.
  // Значения — доли прокрутки сцены.
  const COPY_END = 0.07;
  const PHOTO_FADE = [0.04, 0.19];
  const CANVAS_FADE = [0.15, 0.27];
  const SEQ = [0.17, 0.95]; // после конца держим финальный кадр
  const phase = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);
  const STEP_FRAMES = [0, 76, 113, 158]; // кадры, с которых начинается каждая подпись
  const BG = 'rgb(235, 237, 234)';
  const BG_CLEAR = 'rgba(235, 237, 234, 0)';

  const atelier = $('[data-atelier]');
  const canvas = $('[data-canvas]');
  const ctx = canvas.getContext('2d');
  const hero = $('[data-hero]');
  const heroPhoto = $('[data-hero-photo]');
  const heroCopy = $('[data-hero-copy]');
  const heroText = $('[data-hero-text]');
  const heroCutout = $('[data-hero-cutout]');
  const scrollHint = $('[data-scroll-hint]');
  const captions = $('[data-captions]');
  const captionEls = $$('.caption', captions);
  const progressBar = $('[data-progress]');
  const header = $('[data-header]');
  const headerWordmark = $('[data-header-wordmark]');

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const portraitStart = window.innerWidth < window.innerHeight;
  const neededWidth = (portraitStart ? window.innerWidth * 1.28 : window.innerWidth) * dpr;
  const frameDir = neededWidth <= 1200 ? 'assets/frames-sm' : 'assets/frames';
  const frames = new Array(FRAME_COUNT);

  function loadFrame(i) {
    if (frames[i]) return;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { img.ready = true; if (Math.round(state.frame) === i || !state.drawn) requestDraw(true); };
    img.src = `${frameDir}/${String(i + 1).padStart(4, '0')}.webp`;
    frames[i] = img;
  }
  // Сначала каждый 8-й кадр (быстрый «черновой» проход), затем остальные
  loadFrame(0);
  for (let i = 8; i < FRAME_COUNT; i += 8) loadFrame(i);
  for (let i = 1; i < FRAME_COUNT; i++) loadFrame(i);

  function nearestReady(i) {
    for (let d = 0; d < FRAME_COUNT; d++) {
      const a = frames[i - d], b = frames[i + d];
      if (a && a.ready) return a;
      if (b && b.ready) return b;
    }
    return null;
  }

  // Кадр рисуем в свободной зоне между шапкой и подписями, чтобы подписи не закрывали заколку
  const layout = { top: 0, bottom: 0 };

  function resizeCanvas() {
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    layout.top = header.offsetHeight * dpr;
    layout.bottom = (captions.offsetTop + 72) * dpr;
    requestDraw(true);
  }

  function featherEdges(x, y, w, h) {
    const f = Math.min(w, h) * 0.08;
    const grad = (x0, y0, x1, y1) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, BG);
      g.addColorStop(1, BG_CLEAR);
      return g;
    };
    if (x > 0) {
      ctx.fillStyle = grad(x, 0, x + f, 0); ctx.fillRect(x, y, f, h);
      ctx.fillStyle = grad(x + w, 0, x + w - f, 0); ctx.fillRect(x + w - f, y, f, h);
    }
    if (y > 0) {
      ctx.fillStyle = grad(0, y, 0, y + f); ctx.fillRect(x, y, w, f);
      ctx.fillStyle = grad(0, y + h, 0, y + h - f); ctx.fillRect(x, y + h - f, w, f);
    }
  }

  function draw() {
    const img = nearestReady(Math.round(state.frame));
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const portrait = cw < ch;

    // В кадрах ролика сама заколка занимает примерно центральные 80% высоты,
    // поэтому кадр может слегка заходить под шапку и мягкий градиент подписей
    const availH = Math.max(layout.bottom - layout.top, ch * 0.4);
    const scale = portrait
      ? (cw / iw) * 1.28
      : Math.min(cw / iw, (availH * 1.18) / ih);

    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = layout.top + (availH - dh) / 2;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
    featherEdges(dx, dy, dw, dh);
    state.drawn = true;
  }

  const state = { progress: 0, target: 0, frame: 0, lastDrawn: -1, drawn: false, raf: 0, forced: false };

  function requestDraw(force) {
    if (force) state.forced = true;
    if (!state.raf) state.raf = requestAnimationFrame(tick);
  }

  function sceneProgress() {
    const r = atelier.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  }

  function tick() {
    state.raf = 0;
    const target = state.target;
    state.progress = reduceMotion ? target : state.progress + (target - state.progress) * 0.18;
    if (Math.abs(target - state.progress) < 0.0004) state.progress = target;
    const p = state.progress;

    // 1. Текст и вывеска уходят вверх
    const c = ease(clamp(p / COPY_END, 0, 1));
    [heroCopy, heroText].forEach((el) => {
      el.style.opacity = String(1 - c);
      el.style.transform = `translate3d(0, ${-c * 6}vh, 0)`;
    });
    scrollHint.style.opacity = String(1 - c);

    // 2. Фото Парижа медленно приближается и растворяется в студийный фон;
    //    вырезка девушки масштабируется вместе с фото, чтобы слои не разъезжались
    const ph = ease(phase(p, PHOTO_FADE));
    hero.style.opacity = String(1 - ph);
    hero.style.visibility = ph >= 0.999 ? 'hidden' : 'visible';
    const zoom = `scale(${1 + clamp(p / PHOTO_FADE[1], 0, 1) * 0.14})`;
    heroPhoto.style.transform = zoom;
    heroCutout.style.transform = zoom;

    // 3. Детали заколки проявляются из фона
    const cv = ease(phase(p, CANVAS_FADE));
    canvas.style.opacity = String(cv);
    canvas.style.transform = `scale(${0.92 + cv * 0.08})`;

    // Кадры ролика
    const seq = phase(p, SEQ);
    state.frame = seq * (FRAME_COUNT - 1);
    const idx = Math.round(state.frame);
    if (idx !== state.lastDrawn || state.forced) {
      draw();
      state.lastDrawn = idx;
      state.forced = false;
    }

    // Подписи
    captions.classList.toggle('is-visible', p > CANVAS_FADE[1] - 0.02);
    let step = 0;
    STEP_FRAMES.forEach((f, i) => { if (idx >= f) step = i; });
    captionEls.forEach((el, i) => {
      const on = i === step;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
      $$('button', el).forEach((b) => { b.tabIndex = on ? 0 : -1; });
    });
    progressBar.style.transform = `scaleX(${seq})`;

    updateHeader(p);

    if (state.progress !== target) requestDraw();
  }

  function updateHeader(p) {
    const pastScene = atelier.getBoundingClientRect().bottom <= window.innerHeight * 0.5;
    const photoGone = p > PHOTO_FADE[1] * 0.75;
    headerWordmark.classList.toggle('is-visible', photoGone || pastScene);
    header.classList.toggle('is-solid', photoGone || pastScene);
  }

  function onScroll() {
    state.target = sceneProgress();
    requestDraw();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { resizeCanvas(); onScroll(); });
  resizeCanvas();
  onScroll();

  $('[data-feature-price]').textContent = money(byId.bordeaux.price);

  /* ---------- Каталог ---------- */

  const grid = $('[data-grid]');
  const filtersEl = $('[data-filters]');
  let activeCategory = 'all';

  $('[data-collection-count]').textContent =
    `${PRODUCTS.length} ${plural(PRODUCTS.length, 'предмет', 'предмета', 'предметов')}`;

  CATEGORIES.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c.label;
    b.dataset.category = c.id;
    b.setAttribute('aria-pressed', String(c.id === activeCategory));
    filtersEl.append(b);
  });

  filtersEl.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-category]');
    if (!b) return;
    activeCategory = b.dataset.category;
    $$('button', filtersEl).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderGrid();
  });

  function tile(p) {
    const li = document.createElement('li');
    li.className = 'tile';
    const [main, alt] = p.images;
    li.innerHTML = `
      <button class="tile-media" type="button" data-open-product="${p.id}" aria-label="${p.name} — подробнее">
        <img src="${imgSrc(main)}" alt="${p.kind} ${p.name}, ${p.colour.toLowerCase()}" width="2168" height="1472" loading="lazy" decoding="async">
        ${alt ? `<img class="alt" src="${imgSrc(alt)}" alt="" width="2168" height="1472" loading="lazy" decoding="async">` : ''}
      </button>
      <div class="tile-info">
        <button class="tile-name" type="button" data-open-product="${p.id}">${p.name}</button>
        <span class="price">${money(p.price)}</span>
        <span class="tile-kind">${p.kind}</span>
        <button class="tile-add" type="button" data-add="${p.id}">+ В корзину</button>
      </div>`;
    return li;
  }

  function storyTile() {
    const li = document.createElement('li');
    li.className = 'tile-story';
    li.innerHTML = `
      <img src="assets/hero/paris-1400.webp" alt="Терраса парижского кафе у Сены летом" loading="lazy" decoding="async">
      <div>
        <p>Бокал розового, тёплый камень набережной и волосы, собранные одним движением.</p>
        <p>Летний Париж — в каждой детали коллекции.</p>
      </div>`;
    return li;
  }

  function renderGrid() {
    const list = PRODUCTS.filter((p) => activeCategory === 'all' || p.category === activeCategory);
    grid.replaceChildren();
    list.forEach((p, i) => {
      grid.append(tile(p));
      if (activeCategory === 'all' && i === 3) grid.append(storyTile());
    });
  }
  renderGrid();

  /* ---------- Диалоги ---------- */

  function openDialog(d) {
    if (d.open) return;
    d.showModal();
    document.documentElement.style.overflow = 'hidden';
  }
  $$('dialog').forEach((d) => {
    d.addEventListener('close', () => {
      if (!$$('dialog').some((x) => x.open)) document.documentElement.style.overflow = '';
    });
    d.addEventListener('click', (e) => {
      if (e.target === d) d.close();
      if (e.target.closest('[data-close]')) d.close();
    });
  });

  /* ---------- Карточка товара ---------- */

  const pd = $('[data-product-dialog]');
  const pdMain = $('[data-pd-main]');
  const pdThumbs = $('[data-pd-thumbs]');
  const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

  function showImage(p, i) {
    pdMain.src = imgSrc(p.images[i]);
    pdMain.alt = `${p.kind} ${p.name} — фото ${i + 1} из ${p.images.length}`;
    $$('button', pdThumbs).forEach((b, j) => b.setAttribute('aria-current', String(i === j)));
  }

  function openProduct(id) {
    const p = byId[id];
    if (!p) return;
    $('[data-pd-kind]').textContent = p.kind;
    $('[data-pd-name]').textContent = p.name;
    $('[data-pd-price]').textContent = money(p.price);
    $('[data-pd-desc]').textContent = p.description;
    $('[data-pd-colour]').textContent = p.colour;
    $('[data-pd-category]').textContent = categoryLabel[p.category];
    $('[data-pd-add]').dataset.add = p.id;
    pdThumbs.replaceChildren(...p.images.map((name, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Фото ${i + 1}`);
      b.innerHTML = `<img src="${imgSrc(name)}" alt="">`;
      b.addEventListener('click', () => showImage(p, i));
      return b;
    }));
    pdThumbs.hidden = p.images.length < 2;
    showImage(p, 0);
    openDialog(pd);
  }

  /* ---------- Корзина ---------- */

  const STORAGE_KEY = 'monarca.cart';
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { cart = {}; }
  Object.keys(cart).forEach((id) => { if (!byId[id]) delete cart[id]; });

  const cartDialog = $('[data-cart-dialog]');
  const cartCount = $('[data-cart-count]');
  const views = Object.fromEntries($$('[data-view]', cartDialog).map((v) => [v.dataset.view, v]));

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* приватный режим — живём без сохранения */ }
  }
  const cartLines = () => Object.entries(cart).map(([id, qty]) => ({ p: byId[id], qty }));
  const cartTotal = () => cartLines().reduce((s, l) => s + l.p.price * l.qty, 0);
  const cartQty = () => cartLines().reduce((s, l) => s + l.qty, 0);

  function renderCart() {
    const lines = cartLines();
    cartCount.textContent = String(cartQty());
    cartCount.hidden = cartQty() === 0;
    const list = $('[data-cart-items]');
    list.replaceChildren(...lines.map(({ p, qty }) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${imgSrc(p.images[0])}" alt="">
        <div>
          <h3>${p.name}</h3>
          <p class="kind">${p.kind}</p>
          <div class="qty">
            <button type="button" data-qty="-1" data-id="${p.id}" aria-label="Уменьшить количество">−</button>
            <output aria-label="Количество">${qty}</output>
            <button type="button" data-qty="1" data-id="${p.id}" aria-label="Увеличить количество">+</button>
          </div>
        </div>
        <div class="side">
          <span class="price">${money(p.price * qty)}</span>
          <button class="remove" type="button" data-remove="${p.id}">Удалить</button>
        </div>`;
      return li;
    }));
    const empty = lines.length === 0;
    $('[data-cart-empty]').hidden = !empty;
    $('[data-cart-foot]').hidden = empty;
    $('[data-cart-total]').textContent = money(cartTotal());
    $('[data-checkout-total]').textContent = money(cartTotal());
  }

  function setView(name) {
    Object.entries(views).forEach(([k, v]) => { v.hidden = k !== name; });
    $('[data-cart-title]').textContent = { checkout: 'Оформление', done: 'Заказ' }[name] || 'Корзина';
  }

  function add(id) {
    cart[id] = (cart[id] || 0) + 1;
    save();
    renderCart();
    cartCount.classList.add('is-bump');
    setTimeout(() => cartCount.classList.remove('is-bump'), 300);
    toast(`${byId[id].name} — в корзине`);
  }

  function changeQty(id, d) {
    cart[id] = (cart[id] || 0) + d;
    if (cart[id] <= 0) delete cart[id];
    save();
    renderCart();
  }

  cartDialog.addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]');
    if (q) changeQty(q.dataset.id, Number(q.dataset.qty));
    const r = e.target.closest('[data-remove]');
    if (r) changeQty(r.dataset.remove, -Infinity);
    if (e.target.closest('[data-checkout]')) setView('checkout');
    if (e.target.closest('[data-back]')) setView('items');
  });
  cartDialog.addEventListener('close', () => setView('items'));

  // Заказ пока никуда не отправляется: подключите здесь Telegram-бота, CRM или сервис форм.
  async function sendOrder(order) {
    console.info('MONARCA order', order);
  }

  const form = $('[data-checkout-form]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.elements.name, phone = form.elements.phone;
    const nameOk = name.value.trim().length > 1;
    const phoneOk = phone.value.replace(/\D/g, '').length >= 10;
    name.setAttribute('aria-invalid', String(!nameOk));
    phone.setAttribute('aria-invalid', String(!phoneOk));
    $('[data-form-error]').hidden = nameOk && phoneOk;
    if (!nameOk || !phoneOk) { (nameOk ? phone : name).focus(); return; }

    const order = {
      number: 'M-' + String(Date.now()).slice(-5),
      items: cartLines().map(({ p, qty }) => ({ id: p.id, name: p.name, qty, price: p.price })),
      total: cartTotal(),
      customer: Object.fromEntries(new FormData(form)),
      createdAt: new Date().toISOString()
    };
    await sendOrder(order);
    $('[data-done-text]').textContent =
      `Заказ ${order.number} на ${money(order.total)} оформлен. Мы позвоним по номеру ${order.customer.phone}, чтобы подтвердить детали и доставку.`;
    cart = {};
    save();
    renderCart();
    form.reset();
    setView('done');
  });

  /* ---------- Общие клики ---------- */

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      // Тост живёт под модальным слоем, поэтому карточку товара сначала закрываем
      if (pd.open) pd.close();
      add(addBtn.dataset.add);
      return;
    }
    const openBtn = e.target.closest('[data-open-product]');
    if (openBtn) { openProduct(openBtn.dataset.openProduct); return; }
    if (e.target.closest('[data-cart-open]')) { setView('items'); openDialog(cartDialog); }
  });

  /* ---------- Тост ---------- */

  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  }

  renderCart();
})();
