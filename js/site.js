/* Matrix Homes · site runtime (vanilla JS, no dependencies) */
(() => {
  const D = document, W = window;
  const $ = (s, c = D) => c.querySelector(s), $$ = (s, c = D) => [...c.querySelectorAll(s)];
  const RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = W.MH || { business: {}, runtime: {}, services: [] };
  const B = M.business || {};
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const ba = $('#body-attrs'); if (ba) { ba.className.split(' ').filter(Boolean).forEach(c => D.body.classList.add(c)); Object.assign(D.body.dataset, ba.dataset); }
  if (RM) $$('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });
  if (D.querySelector('.build--hero') && !RM) D.body.classList.add('in-hero');
  /* ---------- intro ---------- */
  const intro = $('#intro');
  if (intro) {
    if (RM || ss.get('mh-intro')) intro.remove();
    else {
      D.body.style.overflow = 'hidden';
      setTimeout(() => { intro.classList.add('is-done'); D.body.style.overflow = ''; ss.set('mh-intro', '1'); setTimeout(() => intro.remove(), 700); }, 1350);
    }
  }

  /* ---------- preview bar ---------- */
  const pbar = $('.preview-bar');
  const setPH = () => D.documentElement.style.setProperty('--preview-h', pbar && !pbar.hidden ? pbar.offsetHeight + 'px' : '0px');
  if (pbar) {
    if (ss.get('mh-pbar')) pbar.hidden = true;
    const b = $('button', pbar); if (b) b.addEventListener('click', () => { pbar.hidden = true; ss.set('mh-pbar', '1'); setPH(); });
    setPH(); W.addEventListener('resize', setPH);
  }

  /* ---------- header ---------- */
  const header = $('.site-header');
  const solidAlways = D.body.dataset.solid === '1';
  const onScrollHeader = () => header && header.classList.toggle('is-solid', solidAlways || (W.scrollY > 40 && !D.body.classList.contains('in-hero')));
  onScrollHeader(); W.addEventListener('scroll', onScrollHeader, { passive: true });

  /* dropdown: opens on hover/focus, closes after a short delay so moving into the panel never drops it */
  $$('.has-menu').forEach(li => {
    let t; const btn = $('.nav-link', li);
    const open = () => { clearTimeout(t); li.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
    const close = (now) => { clearTimeout(t); t = setTimeout(() => { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }, now ? 0 : 220); };
    li.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') open(); });
    li.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') close(); });
    li.addEventListener('focusin', open);
    li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) close(true); });
    li.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(true); btn.focus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); const a = $('.submenu a', li); a && a.focus(); }
    });
  });

  /* mobile menu */
  const mt = $('.menu-toggle'), mm = $('#mobile-menu');
  if (mt && mm) {
    const set = on => {
      mt.setAttribute('aria-expanded', String(on)); mm.classList.toggle('is-open', on); header.classList.toggle('is-open', on);
      D.body.classList.toggle('menu-open', on); mm.setAttribute('aria-hidden', String(!on)); mm.inert = !on;
      if (on) setTimeout(() => { const f = $('a, button', mm); f && f.focus(); }, 60);
    };
    mm.inert = true;
    mt.addEventListener('click', () => set(mt.getAttribute('aria-expanded') !== 'true'));
    D.addEventListener('keydown', e => { if (e.key === 'Escape' && mm.classList.contains('is-open')) { set(false); mt.focus(); } });
    $$('a', mm).forEach(a => a.addEventListener('click', () => set(false)));
    $$('.m-sub-toggle', mm).forEach(b => b.addEventListener('click', () => {
      const s = D.getElementById(b.getAttribute('aria-controls')); const on = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(on)); s.hidden = !on;
    }));
  }

  /* ---------- reveals ---------- */
  const revealEls = $$('.reveal, .split, .dim, .reveal-img');
  if (!RM && 'IntersectionObserver' in W) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.remove('is-pre'); e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => { if (el.getBoundingClientRect().top > W.innerHeight * 0.92) { el.classList.add('is-pre'); io.observe(el); } });
  }

  /* ---------- scroll-linked: parallax + marquee ---------- */
  const px = $$('.parallax img'), mq = $$('.marquee-line');
  let ticking = false;
  const scrollFx = () => {
    ticking = false; const vh = W.innerHeight;
    if (!RM) {
      px.forEach(img => { const r = img.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; const c = (r.top + r.height / 2 - vh / 2) / vh; img.style.transform = `translate3d(0, ${(-c * 7).toFixed(2)}%, 0) scale(1.14)`; });
      mq.forEach((l, i) => { const r = l.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; const p = (vh - r.top) / (vh + r.height); l.style.transform = `translate3d(${((i % 2 ? -1 : 1) * (p * 22 - 14)).toFixed(2)}%,0,0)`; });
    }
    buildUpdate();
  };
  W.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(scrollFx); } }, { passive: true });
  W.addEventListener('resize', () => { sizeCanvas(); scrollFx(); });

  /* service row hover preview */
  const pv = $('.svc-preview');
  if (pv && W.matchMedia('(hover: hover)').matches) {
    const pimg = $('img', pv);
    $$('.svc-row a').forEach(a => {
      a.addEventListener('pointerenter', () => { pimg.src = a.dataset.img; pv.classList.add('is-on'); });
      a.addEventListener('pointerleave', () => pv.classList.remove('is-on'));
      a.addEventListener('pointermove', e => { pv.style.left = e.clientX + 'px'; pv.style.top = e.clientY + 'px'; });
    });
  }

  /* ---------- construction sequence (homepage hero) ---------- */
  const build = $('.build');
  let canvas, ctx, frames = [], buildUpdate = () => {}, sizeCanvas = () => {};
  if (build) {
    const cfg = JSON.parse(build.dataset.cfg);
    const slowDevice = (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''))) || false;
    if (RM || slowDevice || !W.HTMLCanvasElement) { build.classList.add('is-static'); D.body.classList.remove('in-hero'); }
    else {
      const track = $('.build-track', build); canvas = $('canvas', build); ctx = canvas.getContext('2d');
      const N = cfg.count, S = cfg.stages, mobile = W.innerWidth < 760, stride = mobile ? 2 : 1; frames = new Array(N);
      const hiStart = $('.bh-hi--start', build), hiEnd = $('.bh-hi--end', build), open = $('.bh-open', build), hud = $('.bh-hud', build), fin = $('.bh-final', build), finBtn = $('.bh-final a', build);
      let lastDrawn = -1, lastF = 0, started = false;
      const load = i => new Promise(res => { if (frames[i]) return res(); const im = new Image(); im.decoding = 'async'; im.onload = () => { frames[i] = im; res(); if (Math.abs(i - lastF) < 3) { lastDrawn = -1; draw(lastF); } }; im.onerror = res; im.src = cfg.path.replace('{n}', String(i).padStart(3, '0')); });
      const start = async () => {
        if (started) return; started = true;
        await Promise.all(S.map(load));
        const order = []; for (let i = 0; i < N; i += stride) order.push(i);
        let k = 0; const next = () => { if (k >= order.length) { $('.build-loading', build)?.remove(); return; } const batch = order.slice(k, k + 8); k += 8; Promise.all(batch.map(load)).then(next); };
        next();
      };
      start();
      const nearest = f => { for (let d = 0; d < N; d++) { if (frames[f - d]) return f - d; if (frames[f + d]) return f + d; } return -1; };
      const fx = mobile ? 0.58 : 0.55;
      const draw = f => {
        lastF = f; const i = nearest(f); if (i < 0 || i === lastDrawn) return; const im = frames[i]; lastDrawn = i;
        const cw = canvas.width, ch = canvas.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
        const w = im.naturalWidth * s, h = im.naturalHeight * s;
        ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, (cw - w) * fx, (ch - h) / 2, w, h);
      };
      sizeCanvas = () => { const dpr = Math.min(W.devicePixelRatio || 1, 2); canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr); lastDrawn = -1; draw(lastF); };
      // timeline: opening hold, transitions between stages, short holds, long final hold for the headline
      const segs = []; let total = 0;
      S.forEach((f, i) => { const hold = i === 0 ? 0.7 : i === S.length - 1 ? 2.4 : 0.35; segs.push({ a: f, b: f, len: hold, stage: i }); total += hold; if (i < S.length - 1) { segs.push({ a: f, b: S[i + 1], len: 1, stage: i, tr: true }); total += 1; } });
      const FINAL = 2.4;
      const num = $('.bh-num b', build), name = $('.bh-name', build), fill = $('.build-rail .fill', build), rail = $$('.build-rail li', build);
      let curStage = -1, fu = -1;
      buildUpdate = () => {
        const r = track.getBoundingClientRect(); const span = r.height - W.innerHeight; const p = clamp(-r.top / span, 0, 1);
        D.body.classList.toggle('in-hero', r.bottom > W.innerHeight * 0.55); onScrollHeader();
        let u = p * total; const U = u; let f = 0, st = 0;
        for (const s of segs) { if (u <= s.len) { const t = s.len ? u / s.len : 0; const e = s.tr ? t * t * (3 - 2 * t) : t; f = Math.round(s.a + (s.b - s.a) * e); st = s.tr && t > 0.5 ? s.stage + 1 : s.stage; break; } u -= s.len; f = s.b; st = s.stage; }
        draw(clamp(f, 0, N - 1));
        const o = clamp(1 - U / 0.55, 0, 1), finP = clamp((U - (total - FINAL)) / (FINAL * 0.4), 0, 1);
        if (hiStart) hiStart.style.opacity = clamp(1 - U / 0.25, 0, 1);
        if (hiEnd) hiEnd.style.opacity = finP;
        open.style.opacity = o; open.style.transform = `translateY(${(-(1 - o) * 30).toFixed(1)}px)`;
        hud.style.opacity = Math.min(clamp(U / 0.55, 0, 1), 1 - finP);
        fin.style.opacity = finP; fin.style.transform = `translateY(${((1 - finP) * 24).toFixed(1)}px)`;
        fin.classList.toggle('is-live', finP > 0.6); finBtn.tabIndex = finP > 0.6 ? 0 : -1;
        if (fill) fill.style.width = (clamp(U / (total - FINAL), 0, 1) * 100).toFixed(2) + '%';
        if (st !== curStage) { curStage = st; num.textContent = String(st + 1).padStart(2, '0'); name.textContent = cfg.text[st].title; rail.forEach(li => li.classList.toggle('is-on', +li.dataset.stage <= st)); }
      };
      sizeCanvas(); buildUpdate();
    }
  }

  /* ---------- filters (projects, videos) ---------- */
  $$('[data-filters]').forEach(box => {
    const scope = D.getElementById(box.dataset.filters); const items = $$('[data-cat]', scope); const empty = $('.empty-state', scope.parentElement);
    $$('button', box).forEach(b => b.addEventListener('click', () => {
      $$('button', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.filter; let n = 0;
      items.forEach(it => { const on = f === 'all' || it.dataset.cat.split(' ').includes(f); it.hidden = !on; if (on) n++; });
      if (empty) empty.hidden = n > 0;
    }));
  });

  /* ---------- lightbox (images + video) ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const stage = $('.lb-stage', lb), title = $('.lb-title', lb), countEl = $('.lb-count', lb);
    let list = [], idx = 0, opener = null;
    const show = () => {
      const it = list[idx]; stage.innerHTML = '';
      if (it.video) { const v = D.createElement('video'); v.src = it.video; v.controls = true; v.autoplay = true; v.playsInline = true; if (it.poster) v.poster = it.poster; stage.appendChild(v); }
      else { const im = D.createElement('img'); im.src = it.src; im.alt = it.alt || ''; stage.appendChild(im); }
      title.textContent = it.title || ''; countEl.textContent = list.length > 1 ? `${idx + 1} / ${list.length}` : '';
      $$('.lb-nav', lb).forEach(b => b.hidden = list.length < 2);
    };
    const open = (items, i, from) => { list = items; idx = i; opener = from; show(); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); D.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
    const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); stage.innerHTML = ''; D.body.style.overflow = ''; opener && opener.focus(); };
    D.addEventListener('click', e => {
      const t = e.target.closest('[data-lb], [data-video]'); if (!t) return; e.preventDefault();
      if (t.dataset.video) return open([{ video: t.dataset.video, poster: t.dataset.poster, title: t.dataset.title }], 0, t);
      const g = $$(`[data-lb="${t.dataset.lb}"]`); open(g.map(x => ({ src: x.dataset.src, alt: x.dataset.alt, title: x.dataset.title })), g.indexOf(t), t);
    });
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => { idx = (idx - 1 + list.length) % list.length; show(); });
    $('.lb-next', lb).addEventListener('click', () => { idx = (idx + 1) % list.length; show(); });
    D.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight' && list.length > 1) $('.lb-next', lb).click(); if (e.key === 'ArrowLeft' && list.length > 1) $('.lb-prev', lb).click();
      if (e.key === 'Tab') { const f = $$('button:not([hidden]), video', lb); const i = f.indexOf(D.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
  }

  /* before / after */
  $$('.ba input[type=range]').forEach(r => { const box = r.closest('.ba'); const u = () => box.style.setProperty('--pos', r.value + '%'); r.addEventListener('input', u); u(); });

  /* copy buttons */
  const toast = msg => { let t = $('.toast'); if (!t) { t = D.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); D.body.appendChild(t); } t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('is-on'), 1800); };
  D.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const v = b.dataset.copy;
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Copied ' + v)).catch(() => { const s = W.getSelection(), r = D.createRange(); const el = b.previousElementSibling || b; r.selectNodeContents(el); s.removeAllRanges(); s.addRange(r); toast('Selected. Press Ctrl+C to copy.'); });
  });

  /* ---------- leads ---------- */
  const ref = () => 'MH-' + Date.now().toString(36).toUpperCase().slice(-6);
  async function submitLead(kind, data, files = []) {
    const endpoint = M.runtime && M.runtime.leadEndpoint; const id = ref();
    if (endpoint) {
      const fd = new FormData(); fd.append('kind', kind); fd.append('ref', id);
      Object.entries(data).forEach(([k, v]) => fd.append(k, Array.isArray(v) ? v.join(', ') : v));
      files.forEach(f => fd.append('files[]', f));
      const r = await fetch(endpoint, { method: 'POST', body: fd });
      if (!r.ok) throw new Error('send');
      return { ok: true, demo: false, ref: id };
    }
    const all = ls.get('mh-demo-leads') || []; all.push({ kind, ref: id, at: new Date().toISOString(), data, files: files.map(f => f.name) }); ls.set('mh-demo-leads', all);
    return { ok: true, demo: true, ref: id };
  }
  const demoNote = '<p class="notice"><strong>Demo mode.</strong> This inquiry was saved in this browser only and was not sent to Matrix Homes. Connect the lead endpoint before launch.</p>';

  const fieldErr = (el, msg) => { const f = el.closest('.field, fieldset'); if (!f) return; f.classList.toggle('has-error', !!msg); const e = $('.err', f); if (e) e.textContent = msg || ''; if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); };
  const checkField = el => {
    if (el.type === 'radio') { const g = $$(`input[name="${el.name}"]`, el.form); const ok = !el.required || g.some(x => x.checked); fieldErr(el, ok ? '' : 'Please choose an option.'); return ok; }
    if (el.type === 'checkbox') { const ok = !el.required || el.checked; fieldErr(el, ok ? '' : 'Please confirm to continue.'); return ok; }
    const v = el.value.trim(); let m = '';
    if (el.required && !v) m = 'This field is required.';
    else if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = 'Enter a valid email address, like name@example.com.';
    else if (v && el.type === 'tel' && v.replace(/\D/g, '').length < 10) m = 'Enter a 10-digit phone number.';
    else if (v && el.dataset.postal && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(v)) m = 'Enter a Canadian postal code, like M5V 2T6.';
    else if (el.minLength > 0 && v && v.length < el.minLength) m = `Please add a little more detail (at least ${el.minLength} characters).`;
    fieldErr(el, m); return !m;
  };
  const validate = scope => { let first = null; const seen = new Set(); $$('input, select, textarea', scope).forEach(el => { if (el.closest('.hp') || el.type === 'file' || el.type === 'hidden') return; if (el.type === 'radio') { if (seen.has(el.name)) return; seen.add(el.name); } if (!checkField(el) && !first) first = el; }); if (first) first.focus(); return !first; };
  const formData = form => { const o = {}; new FormData(form).forEach((v, k) => { if (v instanceof File) return; o[k] = o[k] ? [].concat(o[k], v) : v; }); return o; };
  const isBot = form => { const hp = $('.hp input', form); const t = +form.dataset.t || 0; return (hp && hp.value) || (Date.now() - t < 2500); };

  /* quote wizard */
  const q = $('#quote-form');
  if (q) {
    q.dataset.t = Date.now();
    const panels = $$('.wz-panel', q), steps = $$('.wz-steps li'), bar = $('.wz-progress i'), meta = $('.wz-meta .label'), prev = $('[data-prev]', q), next = $('[data-next]', q), submit = $('[data-submit]', q);
    let cur = 0; let files = [];
    const go = i => {
      cur = i; panels.forEach((p, k) => p.hidden = k !== i);
      steps.forEach((s, k) => { s.classList.toggle('is-current', k === i); s.classList.toggle('is-done', k < i); });
      bar.style.width = ((i + 1) / panels.length * 100) + '%'; meta.textContent = `Step ${i + 1} of ${panels.length}`;
      prev.disabled = i === 0; next.hidden = i === panels.length - 1; submit.hidden = i !== panels.length - 1;
      const h = $('h2', panels[i]); h && h.focus({ preventScroll: true }); q.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    };
    prev.addEventListener('click', () => go(Math.max(0, cur - 1)));
    next.addEventListener('click', () => { if (validate(panels[cur])) go(cur + 1); });
    q.addEventListener('change', e => { if (e.target.matches('input, select, textarea') && e.target.type !== 'file') checkField(e.target); });
    // files
    const fi = $('#q-files'), fl = $('.file-list', q), dz = $('.dropzone', q), ferr = $('#q-files-err');
    const R = M.runtime || {}; const maxN = R.maxFiles || 6, maxMB = R.maxFileMB || 10, types = R.allowedFileTypes || [];
    const renderFiles = () => { fl.innerHTML = files.map((f, i) => `<li><span>${esc(f.name)} · ${(f.size / 1048576).toFixed(1)} MB</span><button type="button" data-rm="${i}">Remove</button></li>`).join(''); };
    const addFiles = list => {
      const errs = [];
      [...list].forEach(f => {
        const okType = types.includes(f.type) || /\.(jpe?g|png|webp|heic|heif|pdf)$/i.test(f.name);
        if (!okType) errs.push(`${f.name}: use JPG, PNG, WEBP, HEIC or PDF.`);
        else if (f.size > maxMB * 1048576) errs.push(`${f.name}: larger than ${maxMB} MB.`);
        else if (files.length >= maxN) errs.push(`You can attach up to ${maxN} files.`);
        else files.push(f);
      });
      ferr.textContent = [...new Set(errs)].join(' '); renderFiles(); fi.value = '';
    };
    fi.addEventListener('change', () => addFiles(fi.files));
    ['dragover', 'dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove('is-over')));
    dz.addEventListener('drop', e => { e.preventDefault(); addFiles(e.dataTransfer.files); });
    fl.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (!b) return; files.splice(+b.dataset.rm, 1); renderFiles(); });
    q.addEventListener('submit', async e => {
      e.preventDefault(); if (!validate(panels[cur])) return;
      const out = $('#quote-result');
      if (isBot(q)) { out.innerHTML = '<p class="error-summary">Something went wrong. Please call (416) 294-7713.</p>'; return; }
      submit.disabled = true; submit.querySelector('span').textContent = 'Sending';
      try {
        const r = await submitLead('quote', formData(q), files);
        q.hidden = true; $('.wz-steps')?.setAttribute('hidden', '');
        out.innerHTML = `<div class="success" tabindex="-1"><span class="label">Inquiry received</span><h2 class="h3">Thank you. Your project details are with Matrix Homes.</h2><p>Reference <span class="ref">${r.ref}</span>. Matrix Homes will review your inquiry and contact you to arrange a free consultation. For anything urgent, call <b>${esc(B.phone)}</b>.</p>${r.demo ? demoNote : ''}</div>`;
        $('.success', out).focus();
      } catch (err) {
        out.innerHTML = `<p class="error-summary" role="alert">Your inquiry could not be sent. Check your connection and try again, or call ${esc(B.phone)}.</p>`;
        submit.disabled = false; submit.querySelector('span').textContent = 'Send inquiry';
      }
    });
    // preselect project type from ?type= is not available in artifacts; use #hash token instead
    const h = (location.hash || '').slice(1); if (h) { const r = $(`input[name="projectType"][value="${CSS.escape(h)}"]`, q); if (r) r.checked = true; }
    go(0); W.scrollTo(0, 0);
  }

  /* contact form */
  const cf = $('#contact-form');
  if (cf) {
    cf.dataset.t = Date.now();
    cf.addEventListener('change', e => { if (e.target.matches('input, textarea, select')) checkField(e.target); });
    cf.addEventListener('submit', async e => {
      e.preventDefault(); if (!validate(cf)) return; const out = $('#contact-result');
      if (isBot(cf)) { out.innerHTML = '<p class="error-summary">Something went wrong. Please call (416) 294-7713.</p>'; return; }
      try { const r = await submitLead('contact', formData(cf)); cf.reset(); out.innerHTML = `<div class="success" tabindex="-1"><span class="label">Message received</span><p>Thank you. Matrix Homes will reply as soon as possible. Reference <span class="ref">${r.ref}</span>.</p>${r.demo ? demoNote : ''}</div>`; $('.success', out).focus(); }
      catch (err) { out.innerHTML = `<p class="error-summary" role="alert">Your message could not be sent. Please call ${esc(B.phone)}.</p>`; }
    });
  }

  /* ---------- Project Concierge (rule-based assistant) ---------- */
  const launch = $('.concierge-launch'), panel = $('#concierge');
  if (launch && panel) {
    const log = $('.cc-log', panel), form = $('.cc-form', panel), input = $('input', form);
    const svc = M.services || [];
    const link = (href, t) => `<a href="${href}">${esc(t)}</a>`;
    const PRESETS = [
      'What renovation services do you offer?', 'Can I see your completed projects?', 'How do I request an estimate?', 'Do you handle full-home renovations?',
      'What areas do you serve?', 'Can I schedule a consultation?', 'How long does a major renovation take?', 'Can I upload photos of my project?'
    ];
    let lead = null, opened = false;
    const say = (html, opts = {}) => new Promise(res => {
      const ty = D.createElement('div'); ty.className = 'msg bot typing'; ty.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(ty); log.scrollTop = log.scrollHeight;
      setTimeout(() => { ty.remove(); const m = D.createElement('div'); m.className = 'msg bot'; m.innerHTML = html + (opts.actions ? `<div class="actions">${opts.actions}</div>` : ''); log.appendChild(m);
        if (opts.chips) { const c = D.createElement('div'); c.className = 'cc-chips'; c.innerHTML = opts.chips.map(t => `<button type="button">${esc(t)}</button>`).join(''); log.appendChild(c); }
        log.scrollTop = log.scrollHeight; res(); }, RM ? 0 : 420);
    });
    const me = t => { $$('.cc-chips', log).forEach(c => c.remove()); const m = D.createElement('div'); m.className = 'msg me'; m.textContent = t; log.appendChild(m); log.scrollTop = log.scrollHeight; };
    const services = () => `<p>Matrix Homes offers:</p><p>${svc.map(s => link(s.href, s.title)).join(' · ')}</p>`;
    const INTENTS = [
      [/service|offer|do you do|what do you|framing|demolition|excavat|forming|window|kitchen|basement|addition|new home|custom/i, () => say(services(), { actions: link('services.html', 'All services') + link('quote.html', 'Request a quote') })],
      [/project|portfolio|work|photos of your|gallery|completed|examples/i, () => say('<p>Project galleries are coming soon. In the meantime, Matrix Homes posts recent work on Facebook.</p>', { actions: `<a href="${B.facebook}" target="_blank" rel="noopener">Facebook</a>` + link('videos.html', 'Watch films') })],
      [/estimate|quote|price|cost|how much|budget/i, () => say('<p>Every project is priced from its actual scope, so there are no fixed prices. The quickest way to an estimate is the quote form, or I can take your details here.</p>', { actions: link('quote.html', 'Open the quote form'), chips: ['Start an inquiry here', 'No thanks'] })],
      [/full.?home|whole|entire|gut|complete reno/i, () => say('<p>Matrix Homes builds from the ground up: demolition, excavation, framing and new homes, plus additions and basement and kitchen renovations. For a large renovation, the best start is a free consultation so the full scope can be reviewed.</p>', { actions: link('renovations.html', 'Renovations') + link('custom-homes.html', 'Custom homes'), chips: ['Start an inquiry here'] })],
      [/area|where|serve|location|toronto|gta|barrie|orangeville|mississauga|brampton|vaughan|markham|oakville/i, () => say(`<p>Matrix Homes serves the ${esc(B.serviceArea || 'Greater Toronto Area')}. If your property is outside the GTA, share the location and the team will confirm.</p>`, { chips: ['Start an inquiry here'] })],
      [/consult|meet|appointment|book|schedule|visit/i, () => say(`<p>Consultations are free. Call <b>${esc(B.phone)}</b>, email <b>${esc(B.email)}</b>, or I can collect your details now.</p>`, { chips: ['Start an inquiry here', 'No thanks'] })],
      [/how long|timeline|duration|weeks|months|start/i, () => say('<p>It depends on the size of the project, permits, site conditions and the season, so Matrix Homes gives a project-specific schedule with each proposal rather than a general figure.</p>', { actions: link('process.html', 'See the process') })],
      [/upload|photo|picture|image|file|drawing|plan/i, () => say('<p>Yes. The quote form lets you attach up to 6 photos, drawings or PDFs (10 MB each).</p>', { actions: link('quote.html', 'Upload on the quote form') })],
      [/builder|developer|crew|sub.?contract/i, () => say(`<p>Yes, the framing and demolition crews work for builders and developers too. Send plans and timing through the quote form or call ${esc(B.phone)}.</p>`, { actions: link('framing.html', 'Framing') + link('quote.html', 'Send plans') })],
      [/phone|call|email|contact|number/i, () => say(`<p>Phone: <b>${esc(B.phone)}</b><br>Email: <b>${esc(B.email)}</b></p>`, { actions: link('contact.html', 'Contact page') })],
      [/hello|hi\b|hey/i, () => say('<p>Hello. What are you planning to build or renovate?</p>', { chips: PRESETS.slice(0, 4) })]
    ];
    const STEPS = [
      ['type', 'What kind of project are you planning?', svc.map(s => s.title).concat(['Something else'])],
      ['location', 'Where is the property located? A city or postal code is fine.'],
      ['budget', 'What is your approximate budget?', (M.runtime.budgetRanges || []).map(b => b.label)],
      ['timing', 'When would you like to begin?', ['As soon as possible', 'Within 1 to 3 months', 'Within 3 to 6 months', 'Within 6 to 12 months', 'Still planning']],
      ['consult', 'Would you like a free consultation?', ['Yes, please', 'Not yet']],
      ['name', 'What is your name?'],
      ['contact', 'What is the best phone number or email to reach you?']
    ];
    const ask = () => { const s = STEPS[lead.step]; return say(`<p>${s[1]}</p>`, s[2] ? { chips: s[2] } : {}); };
    const startLead = () => { lead = { step: -1, data: {} }; return say(`<p>Before I take any details: your answers are only used to respond to this inquiry. ${link('privacy.html', 'Privacy notice')}.</p><p>Is that okay?</p>`, { chips: ['Yes, continue', 'No thanks'] }); };
    const handleLead = async t => {
      if (lead.step === -1) { if (/^y|ok|sure|continue/i.test(t)) { lead.step = 0; return ask(); } lead = null; return say('<p>No problem. Ask me anything else, or call ' + esc(B.phone) + '.</p>'); }
      const key = STEPS[lead.step][0];
      if (key === 'contact') { const ok = /@/.test(t) ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) : t.replace(/\D/g, '').length >= 10; if (!ok) return say('<p>That does not look like a phone number or email. Could you check it?</p>'); }
      if (key === 'name' && t.trim().length < 2) return say('<p>Could you share your name?</p>');
      lead.data[key] = t; lead.step++;
      if (lead.step < STEPS.length) return ask();
      const nm = (lead.data.name || '').split(' ')[0]; const r = await submitLead('chat', lead.data); lead = null;
      return say(`<p>Thank you${nm ? ', ' + esc(nm) : ''}. Your inquiry is in (reference <b>${r.ref}</b>). Matrix Homes will be in touch to arrange next steps.</p>${r.demo ? '<p><small>Demo mode: saved in this browser only, not sent. Connect the lead endpoint before launch.</small></p>' : ''}`, { actions: link('services.html', 'Browse services') });
    };
    const reply = async t => {
      t = t.trim(); if (!t) return; me(t);
      if (lead) return handleLead(t);
      if (/start an inquiry|start a project|get started|interested/i.test(t)) return startLead();
      if (/^no thanks/i.test(t)) return say('<p>Of course. Anything else I can help with?</p>', { chips: PRESETS.slice(4) });
      for (const [re, fn] of INTENTS) if (re.test(t)) return fn();
      return say(`<p>I can't answer that one reliably. The team can: call <b>${esc(B.phone)}</b> or email <b>${esc(B.email)}</b>, or I can take your details.</p>`, { chips: ['Start an inquiry here', ...PRESETS.slice(0, 2)] });
    };
    const setOpen = on => {
      panel.classList.toggle('is-open', on); launch.setAttribute('aria-expanded', String(on)); panel.setAttribute('aria-hidden', String(!on)); panel.inert = !on;
      if (on) { if (!opened) { opened = true; say('<p>Welcome. Planning a renovation or construction project? I can help you explore our work, understand our services, or request a consultation.</p>', { chips: PRESETS }); } setTimeout(() => input.focus(), 80); }
      else launch.focus();
    };
    panel.inert = true;
    launch.addEventListener('click', () => setOpen(true));
    $('.cc-close', panel).addEventListener('click', () => setOpen(false));
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    log.addEventListener('click', e => { const b = e.target.closest('.cc-chips button'); if (b) reply(b.textContent); });
    form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; reply(v); });
    $$('[data-open-chat]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); setOpen(true); }));
  }

  /* footer year */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
