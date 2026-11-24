/* ==========================================================
   XENIT Energía Renovable — script.js (vanilla, sin dependencias)
   El sitio es legible sin JS; todo aquí solo lo mejora.
   ========================================================== */
(function () {
  'use strict';

  /* Número de WhatsApp: ÚNICA fuente (formato 52 + 10 dígitos). */
  const WHATSAPP_NUMBER = "523326156905";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer:fine)').matches;
  if (reduce) html.classList.add('reduce');
  let vw = window.innerWidth, vh = window.innerHeight;

  /* ---------- WhatsApp ---------- */
  function waUrl(msg) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg || 'Hola XENIT, quiero mi propuesta');
  }
  function initWA() {
    $$('.js-wa').forEach(a => {
      if (!WHATSAPP_NUMBER) { a.setAttribute('href', '#contacto'); return; }
      a.setAttribute('href', waUrl(a.dataset.waMsg));
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
    const fl = $('#waFloat');
    if (!WHATSAPP_NUMBER) {
      if (fl) fl.classList.add('off');
      const alt = $('#formAlt'); if (alt) alt.hidden = false;
      const send = $('#fSend'); if (send) send.style.display = 'none';
      return;
    }
    const b = $('#waBubble');
    if (b && !reduce) {
      setTimeout(() => b.classList.add('on'), 4000);
      setTimeout(() => b.classList.remove('on'), 10000);
    }
  }
  initWA();
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Cargador ---------- */
  (function loader() {
    const L = $('#loader'); if (!L) return;
    const ring = $('#ldRing'), pct = $('#ldPct');
    const t0 = performance.now(); let closed = false;
    function tick(now) {
      if (closed) return;
      const k = clamp((now - t0) / 1800, 0, 1), e = ease(k);
      if (ring) ring.setAttribute('stroke-dasharray', (e * 82).toFixed(2) + ' 100');
      if (pct) pct.textContent = Math.round(e * 100);
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    function close() {
      if (closed) return; closed = true;
      if (ring) ring.setAttribute('stroke-dasharray', '82 100');
      if (pct) pct.textContent = '100';
      L.classList.add('out');
      document.body.classList.add('listo');
      setTimeout(() => L.classList.add('gone'), 700);
    }
    setTimeout(close, 2000);
  })();

  /* ---------- Revelado con respaldo por geometría ---------- */
  const rvEls = $$('.rv, .tl-end, #ringWrap');
  let rvPending = new Set(rvEls);
  function reveal(el) { el.classList.add('in'); rvPending.delete(el); if (io) io.unobserve(el); }
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) reveal(e.target); }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
    rvEls.forEach(el => { if (!el.classList.contains('tl-end')) io.observe(el); });
  }
  function geoReveal() {
    rvPending.forEach(el => {
      if (el.classList.contains('tl-end')) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * .95 && r.bottom > 0) reveal(el);
    });
  }
  let geoQueued = false;
  function queueGeo() { if (geoQueued) return; geoQueued = true; requestAnimationFrame(() => { geoQueued = false; geoReveal(); }); }
  window.addEventListener('scroll', queueGeo, { passive: true });
  window.addEventListener('resize', queueGeo);
  setTimeout(geoReveal, 2000);
  setTimeout(geoReveal, 3500);
  geoReveal();
  if (reduce) rvEls.forEach(reveal);

  /* Elementos con otros disparadores (clase .in propia) */
  const watch = (el, cb, th) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cb(); o.disconnect(); } }), { threshold: th || .2 });
    o.observe(el);
    const chk = () => { const r = el.getBoundingClientRect(); if (r.top < vh * .9 && r.bottom > 0) { cb(); o.disconnect(); window.removeEventListener('scroll', chk); } };
    window.addEventListener('scroll', chk, { passive: true });
    setTimeout(chk, 2000);
  };

  /* ---------- Count-up ---------- */
  function countUp(el) {
    const end = parseFloat(el.dataset.count); if (isNaN(end)) return;
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), d = 1400;
    (function step(now) {
      const k = clamp((now - t0) / d, 0, 1);
      el.textContent = Math.round(end * ease(k));
      if (k < 1) requestAnimationFrame(step); else el.textContent = end;
    })(t0);
  }
  watch($('#ringWrap'), () => $$('.num', $('#ringWrap')).forEach(countUp), .3);

  /* ---------- Menú móvil ---------- */
  (function menu() {
    const b = $('#burger'), m = $('#menu'); if (!b || !m) return;
    const set = open => {
      document.body.classList.toggle('menu-open', open);
      b.setAttribute('aria-expanded', open); m.setAttribute('aria-hidden', !open);
      b.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    b.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    $$('a', m).forEach(a => a.addEventListener('click', () => set(false)));
    m.addEventListener('click', e => { if (e.target === m) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  })();

  /* ---------- Botones magnéticos ---------- */
  if (fine && !reduce) {
    $$('.mag').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 16, y = ((e.clientY - r.top) / r.height - .5) * 16;
        b.style.transform = 'translate(' + clamp(x, -8, 8) + 'px,' + clamp(y, -8, 8) + 'px)';
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- Tilt 3D + spotlight ---------- */
  if (fine && !reduce) {
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg');
        c.style.setProperty('--rx', ((.5 - py) * 12).toFixed(2) + 'deg');
        c.style.setProperty('--mx', (px * 100) + '%'); c.style.setProperty('--my', (py * 100) + '%');
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
    });
  }

  /* ---------- Cursor halo ---------- */
  const cur = $('#cursor');
  let cx = -100, cy = -100, tx = -100, ty = -100;
  if (cur && fine && window.matchMedia('(min-width:1024px)').matches) {
    window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', e => {
      cur.classList.toggle('big', !!e.target.closest('a,button,.tilt,summary'));
    });
  }

  /* ---------- Hero: parallax con mouse ---------- */
  const depthEls = $$('[data-depth]').map(el => ({ el, d: parseFloat(el.dataset.depth), x: 0, y: 0 }));
  let mx = 0, my = 0;
  if (fine && !reduce) window.addEventListener('pointermove', e => { mx = e.clientX / vw - .5; my = e.clientY / vh - .5; }, { passive: true });

  /* ---------- Canvas de energía ---------- */
  (function particles() {
    const cv = $('#energia'); if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d'), hero = $('#inicio');
    let W = 0, H = 0, dpr = 1, horizon = 0, tgt = { x: 0, y: 0 }, sunP = { x: 0, y: 0 };
    let parts = [], waves = [], running = false, inView = true, time = 0, last = 0;
    const desktop = () => vw >= 1024;
    function size() {
      const r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, desktop() ? 2 : 1.5);
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      horizon = H - (desktop() ? .46 : .34) * vh + 24;
      sunP = { x: W - (desktop() ? W * .12 : 40), y: desktop() ? 230 : 190 };
      tgt = desktop() ? { x: W * .78, y: H * .36 } : { x: W * .5, y: H * .5 };
      const n = desktop() ? 78 : 34;
      parts = []; for (let i = 0; i < n; i++) parts.push(spawn(true));
    }
    function spawn(initial) {
      const sp = 1.1 + Math.random() * 1.6;
      const p = { s: 0, x: sunP.x + (Math.random() - .5) * 150, y: sunP.y + (Math.random() - .5) * 90, vx: -Math.sin(.35) * sp, vy: Math.cos(.35) * sp, r: 1 + Math.random() * 1.8, t: 0, dur: 2.2 + Math.random() * 1.6, bx: 0, by: 0, c1: null, c2: null };
      if (initial) { const k = Math.random() * (horizon - p.y) / p.vy; p.x += p.vx * k; p.y += p.vy * k; }
      return p;
    }
    function bez(p, t) {
      const u = 1 - t;
      return { x: u * u * u * p.bx + 3 * u * u * t * p.c1.x + 3 * u * t * t * p.c2.x + t * t * t * tgt.x, y: u * u * u * p.by + 3 * u * u * t * p.c1.y + 3 * u * t * t * p.c2.y + t * t * t * tgt.y };
    }
    function draw(dt) {
      ctx.clearRect(0, 0, W, H); time += dt;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.s === 0) {
          p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          g.addColorStop(0, 'rgba(255,211,107,.95)'); g.addColorStop(1, 'rgba(255,179,43,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.283); ctx.fill();
          if (p.y >= horizon) {
            p.s = 1; p.t = 0; p.bx = p.x; p.by = horizon;
            p.c1 = { x: p.x + (Math.random() - .3) * 120, y: horizon - 160 - Math.random() * 120 };
            p.c2 = { x: lerp(p.x, tgt.x, .6) + (Math.random() - .5) * 120, y: tgt.y + 140 + Math.random() * 80 };
            waves.push({ x: p.x, y: horizon, r: 2, a: .6 });
          }
        } else {
          p.t += dt / p.dur;
          const a = bez(p, clamp(p.t, 0, 1)), b = bez(p, clamp(p.t - .06, 0, 1));
          ctx.strokeStyle = 'rgba(134,224,75,.55)'; ctx.lineWidth = p.r; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y); ctx.stroke();
          ctx.fillStyle = '#86E04B'; ctx.shadowColor = '#86E04B'; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(a.x, a.y, p.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
          if (p.t >= 1) { waves.push({ x: tgt.x, y: tgt.y, r: 2, a: .5, lime: true }); parts[i] = spawn(false); }
        }
      }
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i]; w.r += dt * 60 * .9; w.a -= dt * .9;
        if (w.a <= 0) { waves.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(134,224,75,' + w.a.toFixed(2) + ')'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * (w.lime ? 1 : 2.4), w.r * (w.lime ? 1 : .7), 0, 0, 6.283); ctx.stroke();
      }
      /* Línea de pulso (osciloscopio) en la base */
      ctx.strokeStyle = 'rgba(134,224,75,.45)'; ctx.lineWidth = 1.4; ctx.beginPath();
      const by = H - 18;
      for (let x = 0; x <= W; x += 6) {
        const env = Math.sin((x / W) * Math.PI);
        const y = by + Math.sin(x * .02 + time * 3) * 5 * env + (Math.sin(x * .07 - time * 5) > .96 ? -10 * env : 0);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    function loop(now) {
      if (!running) return;
      const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
      draw(dt); requestAnimationFrame(loop);
    }
    function start() { if (running || reduce || !inView || document.hidden) return; running = true; last = performance.now(); requestAnimationFrame(loop); }
    function stop() { running = false; }
    size();
    if (reduce) { draw(.016); }
    else {
      start();
      if ('IntersectionObserver' in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; inView ? start() : stop(); }).observe(hero);
      document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    }
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 200); });
  })();

  /* ---------- Flujo (nodos) ---------- */
  (function flow() {
    const data = [
      ['01 · SOL Y VIENTO', 'Los dos recursos gratuitos que alimentan tu sistema: sol para los paneles y viento para los aerogeneradores.'],
      ['02 · PANELES CANADIAN SOLAR (TIER 1) Y AEROGENERADORES', 'Equipo de primer nivel con estructura de montaje y cableado especializado para uso solar. Nada improvisado.'],
      ['03 · INVERSOR HUAWEI', 'Convierte la energía de los paneles en corriente utilizable para tu casa, negocio o planta. Inversores Huawei, con cableado especializado para uso solar.'],
      ['04 · TU CASA, NEGOCIO O PLANTA (220V)', 'Tu sistema produce, tú consumes esa energía y tu consumo de la red baja. Incluimos albañilería y adaptación eléctrica a 220V.'],
      ['05 · RED CFE · MEDIDOR BIDIRECCIONAL', 'Si generas de más, queda a tu favor con el medidor bidireccional. Nosotros gestionamos el contrato de interconexión y el cambio de medidor.']
    ];
    const btns = $$('.fn-btn'), tag = $('#fcTag'), txt = $('#fcTxt');
    btns.forEach(b => {
      const show = () => {
        btns.forEach(x => x.classList.toggle('on', x === b));
        const d = data[+b.dataset.i]; tag.textContent = d[0]; txt.textContent = d[1];
      };
      b.addEventListener('click', show); b.addEventListener('mouseenter', show); b.addEventListener('focus', show);
    });
    const last = $('.flink.last');
    if (last && !reduce) setInterval(() => last.classList.toggle('rev'), 6000);
  })();

  /* ---------- Para quién (pestañas) ---------- */
  (function tabs() {
    const box = $('#pq'); if (!box) return;
    const tb = $$('.tab', box), pn = $$('.perfil', box);
    let cur = 0;
    function select(i, user) {
      cur = i;
      if (user) box.classList.add('manual');
      tb.forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i); });
      pn.forEach((p, k) => p.classList.toggle('on', k === i));
      $$('.num', pn[i]).forEach(countUp);
      /* reinicia la animación de la barra */
      tb[i].classList.remove('on'); void tb[i].offsetWidth; tb[i].classList.add('on');
    }
    tb.forEach((t, i) => {
      t.addEventListener('click', () => select(i, true));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { select((cur + 1) % 3, true); tb[cur].focus(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { select((cur + 2) % 3, true); tb[cur].focus(); e.preventDefault(); }
      });
      $$('.tab-bar', t).forEach(bar => bar.addEventListener('animationend', () => { if (!box.classList.contains('manual')) select((cur + 1) % 3, false); }));
    });
  })();

  /* ---------- Galería + visor ---------- */
  (function gallery() {
    const track = $('#galTrack'), view = $('#galView'); if (!track) return;
    const items = $$('.g-btn', track).map(b => ({ src: $('img', b).currentSrc || $('img', b).src, alt: $('img', b).alt, cap: $('.gcap', b).textContent }));
    $$('.gcard', track).forEach((c, i) => c.style.setProperty('--k', i));
    $$('.g-btn', track).forEach((b, i) => b.style.setProperty('--k', i));
    /* Duplica para el bucle infinito (solo si hay JS y movimiento permitido) */
    if (!reduce) {
      $$('.gcard', track).forEach(c => {
        const cl = c.cloneNode(true); cl.setAttribute('aria-hidden', 'true');
        $$('button', cl).forEach(b => b.tabIndex = -1);
        $$('img', cl).forEach(im => im.removeAttribute('loading'));
        track.appendChild(cl);
      });
    }
    if (view) {
      view.addEventListener('touchstart', () => view.classList.add('paused'), { passive: true });
      view.addEventListener('touchend', () => setTimeout(() => view.classList.remove('paused'), 3500), { passive: true });
    }
    const lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap'), x = $('#lbX'), pv = $('#lbP'), nx = $('#lbN');
    let idx = 0, opener = null;
    function load(i, from) {
      idx = (i + items.length) % items.length;
      img.src = items[idx].src; img.alt = items[idx].alt; cap.textContent = items[idx].cap;
      if (from && !reduce) {
        const go = () => {
          const r = from.getBoundingClientRect(), f = img.getBoundingClientRect();
          if (!f.width) return;
          img.style.transition = 'none';
          img.style.transform = 'translate(' + (r.left - f.left) + 'px,' + (r.top - f.top) + 'px) scale(' + (r.width / f.width) + ',' + (r.height / f.height) + ')';
          void img.offsetWidth;
          img.style.transition = 'transform .55s cubic-bezier(.2,.8,.2,1)';
          img.style.transform = 'none';
        };
        if (img.complete) go(); else img.onload = go;
      }
    }
    function open(i, from) {
      opener = document.activeElement; lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('on'));
      document.body.style.overflow = 'hidden';
      load(i, from); x.focus();
    }
    function close() {
      lb.classList.remove('on'); document.body.style.overflow = '';
      setTimeout(() => { lb.hidden = true; }, 350);
      if (opener && opener.focus) opener.focus();
    }
    track.addEventListener('click', e => {
      const b = e.target.closest('.g-btn'); if (!b) return;
      open(+b.dataset.i, $('img', b));
    });
    x.addEventListener('click', close);
    pv.addEventListener('click', () => load(idx - 1));
    nx.addEventListener('click', () => load(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') load(idx - 1);
      if (e.key === 'ArrowRight') load(idx + 1);
      if (e.key === 'Tab') {
        const f = [x, pv, nx], k = f.indexOf(document.activeElement);
        e.preventDefault(); f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });
    let sx = 0;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) load(idx + (d < 0 ? 1 : -1)); }, { passive: true });
  })();

  /* ---------- Celdas solares (fiscal) ---------- */
  (function cells() {
    const c = $('#cells'); if (!c) return;
    const n = vw >= 1024 ? 72 : 40, f = document.createDocumentFragment();
    for (let i = 0; i < n; i++) { const e = document.createElement('i'); e.style.setProperty('--d', (Math.random() * 6).toFixed(2) + 's'); f.appendChild(e); }
    c.appendChild(f);
  })();

  /* ---------- Formulario ---------- */
  (function form() {
    const f = $('#form'); if (!f) return;
    const msgs = { nombre: 'Escribe tu nombre.', tipo: 'Elige el tipo de inmueble.', ciudad: 'Escribe tu estado o ciudad.' };
    f.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      ['nombre', 'tipo', 'ciudad'].forEach(n => {
        const el = f.elements[n], wrap = el.closest('.fld'), er = $('.err', wrap);
        const bad = !el.value || (n === 'nombre' && el.value.trim().length < 2);
        wrap.classList.toggle('bad', bad); er.textContent = bad ? msgs[n] : ''; if (bad) ok = false;
      });
      if (!ok) { const first = $('.fld.bad input, .fld.bad select', f); if (first) first.focus(); return; }
      const g = n => (f.elements[n].value || '').trim();
      const extra = g('mensaje') ? ' ' + g('mensaje') : '';
      const msg = 'Hola XENIT, soy ' + g('nombre') + '. Busco energía renovable para ' + g('tipo').toLowerCase() + '. Mi tarifa: ' + g('tarifa') + '. Ubicación: ' + g('ciudad') + '.' + extra + ' Les mando la foto de mi recibo de CFE por aquí.';
      if (!WHATSAPP_NUMBER) { $('#formAlt').hidden = false; return; }
      window.open(waUrl(msg), '_blank', 'noopener');
      $('#formOk').hidden = false;
    });
    $$('input,select', f).forEach(el => el.addEventListener('input', () => { const w = el.closest('.fld'); w.classList.remove('bad'); const er = $('.err', w); if (er) er.textContent = ''; }));
  })();

  /* ---------- Palabra gigante del footer ---------- */
  watch($('#bigWord'), () => $('#bigWord').classList.add('in'), .3);

  /* ---------- Escenas de scroll (un solo bucle rAF) ---------- */
  const bar = $('#prog'), hdr = $('#hdr'), rootEl = $('.root'), rootDot = $('#rootDot'), trunk = $('#rootTrunk');
  const sun = $('#sun'), heroCopy = $('#heroCopy');
  const cambio = $('#cambioScroll'), steps = $$('.step'), dots = $$('.dots i'), panel = $('.panel');
  const ingS = $('#ingScroll'), ingImg = $('#ingImg'), ingOv = $('#ingOv'), ingTxt = $('#ingTxt'), ingHint = $('#ingHint');
  const solSec = $('#soluciones'), solPin = $('#solPin'), solTrack = $('#solTrack'), solBar = $('#solBar');
  const tl = $('#tl'), tlPath = $('#tlPath'), tlSteps = $$('.tl-step'), tlEnd = $('#tlEnd');
  const trunkLen = trunk && trunk.getTotalLength ? 1 : 1;
  let solOn = false, solMax = 0, curStep = -1, lastY = 0, scrolled = true;

  function setupSol() {
    if (!solSec || !solTrack) return;
    const on = vw >= 900 && !reduce;
    solSec.classList.toggle('pin', on);
    solOn = on;
    if (on) {
      solMax = Math.max(0, solTrack.scrollWidth - (vw - 120));
      solPin.style.height = (solMax + vh) + 'px';
    } else { solPin.style.height = ''; solTrack.style.transform = ''; }
  }
  setupSol();
  window.addEventListener('load', setupSol);
  window.addEventListener('resize', () => { vw = window.innerWidth; vh = window.innerHeight; setupSol(); scrolled = true; });
  window.addEventListener('scroll', () => { scrolled = true; }, { passive: true });

  const prog = el => {
    const r = el.getBoundingClientRect(), total = r.height - vh;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  };

  function scenes() {
    const y = window.scrollY || window.pageYOffset;
    const doc = document.documentElement.scrollHeight - vh;
    const pg = doc > 0 ? clamp(y / doc, 0, 1) : 0;
    if (bar) bar.style.transform = 'scaleX(' + pg.toFixed(4) + ')';
    /* Header: se oculta al bajar, vuelve al subir */
    if (hdr && !document.body.classList.contains('menu-open')) {
      hdr.classList.toggle('hide', y > lastY && y > 240);
    }
    lastY = y;
    /* Raíz de scroll */
    if (rootEl && vw >= 1100) {
      rootEl.style.setProperty('--ro', (1 - pg).toFixed(4));
      if (trunk && trunk.getPointAtLength && rootDot) {
        const L = trunk.getTotalLength(), pt = trunk.getPointAtLength(pg * L);
        rootDot.style.left = pt.x + 'px'; rootDot.style.top = (pt.y / 1000 * vh) + 'px';
      }
    }
    /* Hero */
    if (y < vh * 1.3) {
      if (sun) sun.style.setProperty('--s', (1 + clamp(y / vh, 0, 1) * .25).toFixed(3));
      if (heroCopy && !reduce) { heroCopy.style.setProperty('--sy', (-y * .22).toFixed(1) + 'px'); heroCopy.style.setProperty('--so', clamp(1 - y / (vh * .9), 0, 1).toFixed(2)); }
    }
    /* 01 El cambio */
    if (cambio && !reduce && cambio.getBoundingClientRect().bottom > -100 && cambio.getBoundingClientRect().top < vh + 100) {
      const p = prog(cambio);
      cambio.style.setProperty('--p', p.toFixed(3));
      const s = p < .33 ? 0 : p < .66 ? 1 : 2;
      if (s !== curStep) {
        curStep = s;
        steps.forEach((e, i) => e.classList.toggle('on', i === s));
        dots.forEach((e, i) => e.classList.toggle('on', i === s));
        if (panel) panel.classList.toggle('s3', s === 2);
      }
    }
    /* 03 Ingeniería: foto que se expande */
    if (ingS && ingImg && !reduce) {
      const r = ingS.getBoundingClientRect();
      if (r.bottom > -100 && r.top < vh + 100) {
        const p = prog(ingS), k = ease(clamp(p / .75, 0, 1));
        const w0 = vw >= 768 ? vw * .34 : vw * .72, h0 = vw >= 768 ? vh * .46 : vh * .44;
        ingImg.style.width = lerp(w0, vw, k).toFixed(1) + 'px';
        ingImg.style.height = lerp(h0, vh, k).toFixed(1) + 'px';
        ingImg.style.borderRadius = lerp(28, 0, k).toFixed(1) + 'px';
        const im = ingImg.firstElementChild; if (im) im.style.transform = 'scale(' + lerp(1.15, 1, k).toFixed(3) + ')';
        if (ingOv) ingOv.style.opacity = (k * .95).toFixed(2);
        if (ingTxt) ingTxt.classList.toggle('show', p > .6);
        if (ingHint) ingHint.classList.toggle('off', p > .2);
      }
    }
    /* 04 Soluciones: scroll horizontal */
    if (solOn && solPin) {
      const r = solPin.getBoundingClientRect(), total = r.height - vh;
      const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      solTrack.style.transform = 'translate3d(' + (-p * solMax).toFixed(1) + 'px,0,0)';
      if (solBar) solBar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    }
    /* 07 Proceso: raíz y nodos */
    if (tl) {
      const r = tl.getBoundingClientRect();
      if (r.bottom > -100 && r.top < vh + 100) {
        const p = clamp((vh * .62 - r.top) / r.height, 0, 1);
        if (tlPath) tlPath.style.setProperty('--o', (1 - p).toFixed(4));
        tlSteps.forEach(s => {
          const n = $('.tl-node', s).getBoundingClientRect();
          if (n.top < vh * .72) s.classList.add('lit');
        });
        if (tlEnd && p > .93) tlEnd.classList.add('lit');
        if (p > .93 && tlEnd) tlEnd.classList.add('lit');
      }
    }
  }

  /* ---------- Bucle principal ---------- */
  function frame() {
    if (scrolled) { scrolled = false; scenes(); }
    /* Parallax suave del hero */
    if (fine && !reduce && window.scrollY < vh * 1.2) {
      depthEls.forEach(o => {
        o.x = lerp(o.x, mx * o.d, .06); o.y = lerp(o.y, my * o.d, .06);
        o.el.style.transform = 'translate3d(' + o.x.toFixed(2) + 'px,' + o.y.toFixed(2) + 'px,0)';
      });
    }
    if (cur) {
      cx = lerp(cx, tx, .18); cy = lerp(cy, ty, .18);
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
    }
    requestAnimationFrame(frame);
  }
  scenes();
  requestAnimationFrame(frame);

  /* Respaldos finales: si algo quedó sin resolver, que no haya contenido oculto */
  setTimeout(() => { geoReveal(); setupSol(); scenes(); }, 2500);
})();
