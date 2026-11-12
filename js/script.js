// Menú desplegable en celular
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

// Login: cambiar entre "Log In" y "Create Account"
document.querySelectorAll('[data-t]').forEach(el => el.addEventListener('click', e => {
  e.preventDefault();
  const t = el.dataset.t;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.t === t));
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === t));
}));
// Contacto: mensaje de confirmación (aún no envía nada)
const cf = document.getElementById('contactForm');
if (cf) cf.addEventListener('submit', e => { e.preventDefault(); cf.querySelector('.ok').hidden = false; cf.reset(); });
// Login: no envía nada todavía
document.querySelectorAll('#login').forEach(f => f.addEventListener('submit', e => e.preventDefault()));

// Galería de bienestar: la foto activa se expande
const wb = document.querySelectorAll('.wb-gallery figure');
wb.forEach(f => ['mouseenter', 'click'].forEach(ev => f.addEventListener(ev, () => {
  wb.forEach(x => x.classList.toggle('on', x === f));
})));

// Carrusel de Pet Moments: se arrastra, se mueve con flechas del teclado y la foto del centro se amplía
const flow = document.getElementById('cf');
if (flow) {
  const cards = [...flow.children], dots = document.getElementById('cfDots');
  let cur = 5, over = false, drag = null, moved = false, boxOpen = false;
  flow.tabIndex = 0; flow.setAttribute('role', 'region'); flow.setAttribute('aria-label', 'Pet Moments photos. Use the arrow keys to move.');
  cards.forEach((_, i) => { const d = document.createElement('i'); d.addEventListener('click', () => go(i)); dots.appendChild(d); });
  function go(n) {
    const prev = cur;
    cur = (n + cards.length) % cards.length;
    if (prev !== cur) cards.forEach(c => c.querySelector('.cf-flip').classList.remove('flipped'));
    const narrow = window.innerWidth < 760, step = narrow ? 120 : 250;
    cards.forEach((c, i) => {
      let o = i - cur;
      if (o > cards.length / 2) o -= cards.length;
      if (o < -cards.length / 2) o += cards.length;
      const a = Math.abs(o);
      c.style.transform = `translateX(${o * step}px) translateY(${o === 0 ? 0 : 30 + a * 8}px) rotate(${o * 9}deg) scale(${o === 0 ? 1 : .9})`;
      c.style.zIndex = 10 - a;
      c.style.opacity = a > 3 ? 0 : 1;
      c.style.pointerEvents = a > 3 ? 'none' : 'auto';
      c.classList.toggle('act', o === 0);
    });
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === cur));
  }
  // foto ampliada
  const lb = document.createElement('div'); lb.className = 'lightbox';
  lb.innerHTML = '<button class="lb-x" aria-label="Close">&times;</button><button class="lb-p" aria-label="Previous">&#8249;</button><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><button class="lb-n" aria-label="Next">&#8250;</button>';
  document.body.append(lb);
  const lbImg = lb.querySelector('img');
  function show(i) { go(i); lbImg.src = cards[cur].querySelector('img').src; }
  function openBox() { show(cur); lb.classList.add('open'); boxOpen = true; }
  function closeBox() { lb.classList.remove('open'); boxOpen = false; }
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-x')) closeBox(); });
  lb.querySelector('.lb-p').addEventListener('click', () => show(cur - 1));
  lb.querySelector('.lb-n').addEventListener('click', () => show(cur + 1));
  addEventListener('keydown', e => {
    if (boxOpen) { if (e.key === 'Escape') closeBox(); if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); }
    else if (document.activeElement === flow) { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); if (e.key === 'Enter') flip(); }
  });
  cards.forEach((c, i) => {
    c.addEventListener('click', e => {
      if (moved) return;
      if (e.target.closest('.cf-zoom')) { e.stopPropagation(); if (i === cur) openBox(); return; }
      i === cur ? flip() : go(i);
    });
  });
  function flip() { cards[cur].querySelector('.cf-flip').classList.toggle('flipped'); }
  document.getElementById('cfPrev').addEventListener('click', () => go(cur - 1));
  document.getElementById('cfNext').addEventListener('click', () => go(cur + 1));
  // arrastrar / deslizar con el dedo
  flow.addEventListener('pointerdown', e => { drag = e.clientX; moved = false; });
  flow.addEventListener('pointermove', e => { if (drag !== null && Math.abs(e.clientX - drag) > 55) { moved = true; go(cur + (e.clientX < drag ? 1 : -1)); drag = e.clientX; } });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => flow.addEventListener(ev, () => { drag = null; setTimeout(() => moved = false, 60); }));
  window.addEventListener('resize', () => go(cur));
  go(cur);
  ['mouseenter', 'focusin'].forEach(e => flow.addEventListener(e, () => over = true));
  ['mouseleave', 'focusout'].forEach(e => flow.addEventListener(e, () => over = false));
  setInterval(() => { if (!over && !boxOpen && !document.hidden && !flow.querySelector('.flipped')) go(cur + 1); }, 3600);
}

// Barra de progreso y menú que se encoge al hacer scroll
const bar = document.createElement('div');
bar.className = 'progress';
document.body.prepend(bar);
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  nav.classList.toggle('scrolled', scrollY > 40);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Los elementos aparecen al llegar a ellos
const targets = [
  ['.raised h2', ''], ['.believe', 'z'], ['.wellbeing-card', ''], ['.wb-gallery', ''], ['.petmap > h2', ''], ['.petmap-panel', ''],
  ['.moments h2', ''], ['.moments > p', ''], ['.coverflow', 'z'], ['.footer-logo', 'l'], ['.footer-info', 'r'],
  ['.ab-blur h1', 'l'], ['.ab-blur p', 'r'], ['.ab-banner', 'z'], ['.ab-purple h2', ''], ['.ab-row p', 'l'], ['.ab-row img', 'r'], ['.ab-team h2', ''],
  ['.f-hero h1', 'l'], ['.f-hero p', ''], ['.f-hero .btn', 'z'], ['.blobdog', 'r'],
  ['.f-road h2', 'l'], ['.f-road > p', 'l'], ['.bubble', 'z'], ['.f-med .clips', 'l'], ['.f-med h2', 'r'], ['.f-med .txt p', 'r'],
  ['.f-paw h2', 'l'], ['.f-paw .txt p', 'l'], ['.stage', 'r'], ['.f-cal h2', ''], ['.cal', 'l'], ['.f-cal .txt', 'r'], ['.tag', 'z'],
  ['.f-moments h2', ''], ['.f-moments > p', ''], ['.photos img', 'z'], ['.f-close > p', 'l'], ['.pets', 'r'], ['.f-close h2', ''], ['.f-close h3', ''],
  ['.c-left h1', 'l'], ['.c-left > p', 'l'], ['.c-data', 'l'], ['.c-card', 'r'], ['.p-sec h1', ''], ['.p-sec h2', ''], ['.p-sec p', '']
];
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
targets.forEach(([sel, kind]) => document.querySelectorAll(sel).forEach((el, i) => {
  el.classList.add('rv'); if (kind) el.classList.add(kind);
  el.style.setProperty('--d', (i % 4) * .12 + 's');
  io.observe(el);
}));

// Galería de bienestar: se mueve sola si no la tocan
const wbs = [...document.querySelectorAll('.wb-gallery figure')];
if (wbs.length) {
  wbs.forEach((f, i) => f.addEventListener('focusin', () => wbs.forEach((x, k) => x.classList.toggle('on', k === i))));
  let k = 0, hover = false, hold = 0;
  wbs.forEach((f, i) => ['click', 'focusin'].forEach(ev => f.addEventListener(ev, () => { k = i; hold = Date.now() + 9000; })));
  const g = document.querySelector('.wb-gallery');
  g.addEventListener('mouseenter', () => hover = true);
  g.addEventListener('mouseleave', () => hover = false);
  setInterval(() => { if (hover || Date.now() < hold) return; k = (k + 1) % wbs.length; wbs.forEach((x, i) => x.classList.toggle('on', i === k)); }, 3500);
}

// Botón para volver arriba y carrusel de Pet Moments que avanza solo
(function () {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = document.createElement('button');
  top.className = 'totop'; top.setAttribute('aria-label', 'Back to top'); top.innerHTML = '&#8593;';
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }));
  document.body.append(top);
  const foot = document.querySelector('.footer');
  const place = () => { top.classList.toggle('show', scrollY > 700); const over = foot ? innerHeight - foot.getBoundingClientRect().top : 0; top.style.bottom = (over > 0 ? over + 14 : 18) + 'px'; };
  addEventListener('scroll', place, { passive: true }); addEventListener('resize', place); addEventListener('load', place);
  if ('ResizeObserver' in window) new ResizeObserver(place).observe(document.body);
  place();
})();

// Privacy: índice que sigue la lectura y tarjetas que aparecen
(function () {
  const toc = [...document.querySelectorAll('.pv-toc a')]; if (!toc.length) return;
  const secs = toc.map(a => document.querySelector(a.getAttribute('href')));
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) toc.forEach((a, i) => a.classList.toggle('on', secs[i] === e.target)); }), { rootMargin: '-35% 0px -55% 0px' });
  secs.forEach(s => spy.observe(s));
  const els = document.querySelectorAll('.pv-card,.pv-mini,.pv-cta,.pv-toc');
  els.forEach((el, i) => { el.classList.add('pv-reveal'); el.style.setProperty('--d', (i % 3) * 0.1 + 's'); });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  els.forEach(el => io.observe(el));
})();

// Rastro de huellitas que sigue al mouse (solo con mouse; se apaga si prefieres menos movimiento)
(function () {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const paw = c => 'url("data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="${c}"><ellipse cx="32" cy="43" rx="14" ry="12"/><ellipse cx="11" cy="29" rx="6" ry="8"/><ellipse cx="24" cy="15" rx="6" ry="8"/><ellipse cx="40" cy="15" rx="6" ry="8"/><ellipse cx="53" cy="29" rx="6" ry="8"/></svg>`) + '")';
  let lx = -999, ly = -999, side = 1, n = 0;
  addEventListener('mousemove', e => {
    const d = Math.hypot(e.clientX - lx, e.clientY - ly);
    if (d < 80) return;
    const ang = Math.atan2(e.clientY - ly, e.clientX - lx) * 180 / Math.PI + 90;
    if (lx > -900) {
      side *= -1;
      const p = document.createElement('i'); p.className = 'trail';
      p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
      p.style.backgroundImage = paw(n++ % 2 ? '#8268D5' : '#0BC1E0');
      p.style.transform = `rotate(${ang}deg) translateX(${side * 9}px)`;
      p.addEventListener('animationend', () => p.remove()); document.body.append(p);
    }
    lx = e.clientX; ly = e.clientY;
  }, { passive: true });
})();

// Cambio suave entre páginas
(function () {
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
    const u = a.getAttribute('href');
    if (!/^[\w-]+\.html(#.*)?$/.test(u) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => { location.href = a.href; }, 220);
  });
})();

// Con sesión iniciada, "LOG IN" pasa a ser "MY PANEL"
(function () {
  try {
    if (!sessionStorage.getItem('pn-session') || !localStorage.getItem('pn-account')) return;
    const a = document.querySelector('.nav-login'); if (!a) return;
    a.setAttribute('href', 'panel.html'); const u = a.querySelector('u'); if (u) u.textContent = 'MY PANEL';
    if (window.pnApply) window.pnApply(a);
  } catch (e) {}
})();
