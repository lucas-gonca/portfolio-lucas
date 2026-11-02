/* =========================================================
   Portfolio · Lucas Gonçalves Dias
   Lee content.json y arma la página. No hace falta tocar
   este archivo para cambiar textos, fotos o links.
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Ayudantes ---------- */

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const isPending = (v) => typeof v === 'string' && v.includes('[PENDIENTE]');

  // Texto seguro; si dice [PENDIENTE] se resalta para que se vea
  const tx = (v) => (isPending(v) ? `<span class="pending">${esc(v)}</span>` : esc(v));

  const has = (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);

  const pad = (n) => String(n).padStart(2, '0');

  const COLORS = {
    turq: 'var(--turq)',
    yellow: 'var(--yellow)',
    pink: 'var(--pink)',
    red: 'var(--red-deep)',
    mint: 'var(--mint)',
    ink: 'var(--ink)',
    paper: 'var(--paper)',
  };
  const color = (name) => COLORS[name] || COLORS.turq;
  // Fondos oscuros llevan texto claro (contraste AA)
  const toneOf = (name) => (name === 'red' || name === 'ink' ? 'light' : 'dark');

  const ICONS = {
    play: '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>',
    chat: '<path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6l-5 4v-4.2A3 3 0 0 1 4 13z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/>',
    megaphone: '<path d="M3 10.5v3a1.5 1.5 0 0 0 1.5 1.5H7l7 4.5v-15L7 9H4.5A1.5 1.5 0 0 0 3 10.5z"/><path d="M18 9a4.5 4.5 0 0 1 0 6"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="4"/><path d="M8.5 7l1.5-3h4l1.5 3"/><circle cx="12" cy="13.5" r="3.5"/>',
    arrow: '<path d="M7 17L17 7M9 7h8v8"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    whatsapp: '<path d="M4 20l1.4-4.2A8 8 0 1 1 8.3 18.7z"/><path d="M9 9c0 3.3 2.7 6 6 6l1-1.5-2-1-1 1a4 4 0 0 1-2.5-2.5l1-1-1-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7.5l8 5.5 8-5.5"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor"/>',
    playSolid: '<path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2a.8.8 0 0 0-1.2.7z" fill="currentColor" stroke="none"/>',
    chevronLeft: '<path d="M15 5.5L8.5 12l6.5 6.5"/>',
    chevronRight: '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
    expand: '<path d="M14.5 4H20v5.5M9.5 20H4v-5.5M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
  };
  const icon = (name) =>
    `<svg class="icon icon--${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.arrow}</svg>`;

  // Formas decorativas (stickers). Siempre aria-hidden.
  const SHAPES = {
    sparkle: (fill) =>
      `<svg viewBox="0 0 100 100"><path d="M50 4C55 36 64 45 96 50C64 55 55 64 50 96C45 64 36 55 4 50C36 45 45 36 50 4Z" fill="${fill}"/></svg>`,
  };
  const deco = (shape, fill, cls) => `<span class="deco ${cls}" aria-hidden="true">${SHAPES[shape](fill)}</span>`;

  const handArrow =
    '<svg viewBox="0 0 46 40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6c14-3 30 4 36 26"/><path d="M32 27l8 6 3-10"/></svg>';

  // Marco de imagen con tamaño fijo. Si la foto todavía no existe,
  // se ve el cartel [PENDIENTE] con la ruta donde hay que ponerla.
  const frame = (img, { ratio = '16 / 10', label = 'Imagen', eager = false, cls = '' } = {}) => {
    if (!img || !img.src) return '';
    const w = Number(img.width) || 1600;
    const h = Number(img.height) || 1000;
    return `<figure class="frame ${cls}" style="--ratio:${esc(ratio)}">
        <span class="frame__ph"><span class="pending">[PENDIENTE] ${esc(label)}</span><small>${esc(img.src)}</small></span>
        <img src="${esc(img.src)}" alt="${esc(img.alt)}" width="${w}" height="${h}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>
      </figure>`;
  };

  // El load/error de una imagen recién insertada siempre llega después,
  // así que alcanza con escuchar los eventos.
  const watchImages = (root) => {
    root.querySelectorAll('.frame img').forEach((img) => {
      const box = img.closest('.frame');
      img.addEventListener('load', () => box.classList.add('is-loaded'), { once: true });
      img.addEventListener('error', () => { box.classList.add('is-missing'); img.remove(); }, { once: true });
    });
  };

  const cvButton = (cv, cls = '') =>
    `<a class="btn ${cls}" href="${esc(cv.file)}" download="${esc(cv.downloadName)}">${icon('download')}<span>${tx(cv.label)}</span></a>`;

  const isExternal = (url) => /^https?:\/\//.test(url);
  const linkAttrs = (url) => `href="${esc(url)}"${isExternal(url) ? ' target="_blank" rel="noopener"' : ''}`;

  /* ---------- Secciones ---------- */

  let sectionCount = 0;

  // Prepara una sección: si no tiene contenido, la oculta
  const section = (id, visible) => {
    const el = document.getElementById(id);
    if (!el) return null;
    el.hidden = !visible;
    if (!visible) return null;
    el.setAttribute('aria-labelledby', `${id}-title`);
    sectionCount += 1;
    return el;
  };

  const head = (id, s) => `
    <header class="section-head">
      <p class="eyebrow"><span class="eyebrow__num">${pad(sectionCount)}</span>${tx(s.eyebrow)}</p>
      <h2 class="section-title" id="${id}-title">${tx(s.title)}</h2>
      ${has(s.intro) || has(s.note) ? `
        <div class="section-head__aside">
          ${has(s.intro) ? `<p class="section-intro">${tx(s.intro)}</p>` : ''}
          ${has(s.note) ? `<p class="section-note" aria-hidden="true">${esc(s.note)} ↓</p>` : ''}
        </div>` : ''}
    </header>`;

  const renderHero = ({ hero, cv }) => {
    const words = hero.rotatingWords || [];
    const spoken = words.length > 1 ? `${words.slice(0, -1).join(', ')} y ${words[words.length - 1]}` : words[0] || '';
    $('#inicio').innerHTML = `
      <div class="hero__bg" aria-hidden="true">
        <span class="orb orb--1"></span><span class="orb orb--2"></span><span class="orb orb--3"></span>
      </div>
      <div class="container hero__grid">
        <div class="hero__text">
          <p class="kicker">
            <span class="kicker__tag"><span class="live" aria-hidden="true"></span>${tx(hero.badge)}</span>
            <span>${tx(hero.kicker)}</span>
          </p>
          <h1 class="hero__title">
            <span class="hero__line">${tx(hero.titleBefore)}</span>
            <span class="rotator" aria-hidden="true"><span class="rotator__word">${esc(words[0])}</span></span>
            <span class="visually-hidden">${esc(spoken)}</span>
            <span class="hero__line">${tx(hero.titleAfter)}</span>
          </h1>
          <p class="hero__subtitle">${tx(hero.subtitle)}</p>
          ${has(hero.text) ? `<p class="hero__lead">${tx(hero.text)}</p>` : ''}
          <div class="hero__actions">
            <a class="btn btn--ink btn--lg" href="#proyectos">${tx(hero.ctaProjects)}</a>
            ${cvButton(cv, 'btn--yellow btn--lg')}
          </div>
        </div>
        <div class="hero__visual">
          <div class="hero__blob" aria-hidden="true"></div>
          ${frame(hero.photo, { ratio: '4 / 5', label: 'Foto de Lucas · vertical 4:5, mín. 1200 px de alto', eager: true, cls: 'hero__photo' })}
          ${has(hero.note) ? `<p class="hand hero__note" aria-hidden="true">${handArrow}${esc(hero.note)}</p>` : ''}
          ${deco('sparkle', '#F7C317', 'hero__star')}
        </div>
      </div>`;
    startRotator(words);
  };

  const startRotator = (words) => {
    const box = $('.rotator');
    const word = $('.rotator__word');
    if (!box || words.length < 2) return;
    const tones = ['var(--turq)', 'var(--yellow)', 'var(--pink)'];
    let i = 0;
    let timer = null;

    const paint = () => {
      word.textContent = words[i];
      box.style.setProperty('--word-bg', tones[i % tones.length]);
    };
    // El resaltado se estira o se achica suave hasta el ancho de la palabra nueva
    const fit = () => {
      const cs = getComputedStyle(box);
      box.style.width = `${word.offsetWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)}px`;
    };
    const next = () => {
      if (!box.style.width) box.style.width = `${box.offsetWidth}px`;
      word.classList.remove('is-in');
      word.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        word.classList.remove('is-out');
        paint();
        fit();
        void word.offsetWidth; // reinicia la animación
        word.classList.add('is-in');
      }, 300);
    };
    const run = () => {
      clearInterval(timer);
      timer = null;
      if (reduceMotion.matches) { i = 0; paint(); box.style.width = ''; return; }
      timer = setInterval(next, 2800);
    };

    paint();
    run();
    reduceMotion.addEventListener?.('change', run);
    // Si cambia el tamaño de pantalla, la letra cambia de tamaño: se vuelve a medir
    window.addEventListener('resize', () => { box.style.width = ''; }, { passive: true });
  };

  const renderMarquee = ({ marquee }) => {
    const el = $('#marquee');
    if (!has(marquee)) { el.hidden = true; return; }
    const items = marquee.map((m) => `<li>${esc(m)}</li>`).join('');
    el.innerHTML = `
      <div class="marquee__inner">
        <ul class="marquee__list" aria-label="Servicios">${items}</ul>
        <ul class="marquee__list" aria-hidden="true">${items}</ul>
      </div>`;
  };

  const renderStats = ({ stats }) => {
    const el = section('numeros', has(stats?.items));
    if (!el) return;
    el.innerHTML = `
      <div class="container">
        ${head('numeros', stats)}
        <ul class="stats">
          ${stats.items.map((s) => `
            <li class="stat" style="--c:${color(s.color)}">
              ${isPending(s.value)
                ? `<span class="stat__value">${tx(s.value)}</span>`
                : `<span class="stat__value"><span data-count aria-hidden="true">${esc(s.value)}</span><span class="visually-hidden">${esc(s.value)}</span></span>`}
              <span class="stat__label">${tx(s.label)}</span>
              ${has(s.source) ? `<span class="stat__source">${tx(s.source)}</span>` : ''}
            </li>`).join('')}
        </ul>
      </div>`;
  };

  const renderAbout = ({ about }) => {
    const el = section('sobre-mi', has(about?.paragraphs));
    if (!el) return;
    el.innerHTML = `
      <div class="container about__grid">
        <div class="about__text">
          ${head('sobre-mi', about)}
          ${about.paragraphs.map((p, i) => `<p${i === 0 ? ' class="lead"' : ''}>${tx(p)}</p>`).join('')}
          ${has(about.facts) ? `
            <div class="about__facts">
              <h3>${tx(about.factsTitle)}</h3>
              <ul class="chips">${about.facts.map((f) => `<li>${tx(f)}</li>`).join('')}</ul>
            </div>` : ''}
        </div>
        ${about.photo ? `
          <div class="about__visual">
            ${frame(about.photo, { ratio: '4 / 5', label: 'Foto secundaria (opcional)' })}
            <span class="about__ring" aria-hidden="true"></span>
          </div>` : ''}
      </div>`;
  };

  const renderServices = ({ services }) => {
    const el = section('servicios', has(services?.items));
    if (!el) return;
    el.innerHTML = `
      <div class="container">
        ${head('servicios', services)}
        <ul class="services">
          ${services.items.map((s, i) => `
            <li class="service" style="--c:${color(s.color)}">
              <span class="service__icon">${icon(s.icon)}</span>
              <span class="service__num" aria-hidden="true">${pad(i + 1)}</span>
              <h3>${tx(s.title)}</h3>
              <p>${tx(s.text)}</p>
            </li>`).join('')}
        </ul>
      </div>`;
  };

  /* ---------- Fotos y videos de cada proyecto ---------- */

  // Lo que se muestra en la vista ampliada, por proyecto
  const MEDIA = new Map();

  const videoType = (src) => (src.endsWith('.webm') ? 'video/webm' : 'video/mp4');

  // Acepta "videos": [...] (varios) o "video": {...} (uno solo)
  const videosOf = (p) => (p.videos || (p.video ? [p.video] : [])).filter(Boolean);

  // Botones de anterior / siguiente + puntitos + contador
  const sliderUi = (n, noun) => `
    <div class="carousel__ui">
      <button class="round-btn" type="button" data-dir="-1" aria-label="${noun} anterior">${icon('chevronLeft')}</button>
      <button class="round-btn" type="button" data-dir="1" aria-label="${noun} siguiente">${icon('chevronRight')}</button>
      <span class="carousel__dots" aria-hidden="true">${'<span class="carousel__dot"></span>'.repeat(n)}</span>
      <span class="carousel__count" aria-live="polite">1 / ${n}</span>
    </div>`;

  // Carrusel de imágenes: se desliza con el dedo, con flechas o con el teclado
  const carousel = (p, images) => {
    const many = images.length > 1;
    return `
      <div class="carousel" data-slider>
        <div class="carousel__track" data-track${many ? ` tabindex="0" role="region" aria-roledescription="carrusel" aria-label="Imágenes de ${esc(p.name)}"` : ''}>
          ${images.map((img, k) => `
            <div class="carousel__slide">
              ${frame(img, { label: `Imagen ${k + 1} de ${p.name} · 16:10` })}
              <button class="carousel__zoom" type="button" data-zoom="${k}" aria-label="Ampliar imagen ${k + 1} de ${images.length}: ${esc(img.alt)}">
                <span class="carousel__zoom-badge">${icon('expand')}</span>
              </button>
            </div>`).join('')}
        </div>
        ${many ? sliderUi(images.length, 'Imagen') : ''}
      </div>`;
  };

  // Video dentro de un marco de celular. El video de adentro es solo una vista
  // previa muda; al tocarlo se abre la vista ampliada con sonido.
  const phone = (p, v, k, extra = 0) => `
    <div class="phone">
      <div class="phone__screen">
        <video muted loop playsinline preload="none"${v.poster ? ` poster="${esc(v.poster)}"` : ''} aria-hidden="true" tabindex="-1">
          <source src="${esc(v.src)}" type="${videoType(v.src)}">
        </video>
      </div>
      <button class="phone__play" type="button" data-play="${k}" aria-label="Ver video: ${esc(v.label || `Video de ${p.name}`)}">
        <span class="phone__play-icon">${icon('playSolid')}</span>
      </button>
      ${extra ? `<span class="phone__more" aria-hidden="true">+${extra} video${extra > 1 ? 's' : ''}</span>` : ''}
    </div>`;

  // Carrusel de reels: el del medio se agranda
  const reels = (p, files) => `
    <div class="reels" data-slider data-coverflow>
      <div class="reels__track" data-track tabindex="0" role="region" aria-roledescription="carrusel" aria-label="Videos de ${esc(p.name)}">
        ${files.map((v, k) => `<div class="reels__slide">${phone(p, v, k)}</div>`).join('')}
      </div>
      ${sliderUi(files.length, 'Video')}
    </div>`;

  const renderMedia = (p) => {
    const images = (p.images || []).filter((img) => img && img.src);
    const files = videosOf(p).filter((v) => v.type === 'file' && has(v.src));
    const links = videosOf(p).filter((v) => v.type === 'link' && has(v.url));
    MEDIA.set(String(p.id), { images, videos: files });

    let show = '';
    if (images.length && files.length) {
      show = `<div class="showcase showcase--combo">${carousel(p, images)}<div class="showcase__phone">${phone(p, files[0], 0, files.length - 1)}</div></div>`;
    } else if (files.length > 1) {
      show = `<div class="showcase">${reels(p, files)}</div>`;
    } else if (files.length === 1) {
      show = `<div class="showcase showcase--single">${phone(p, files[0], 0)}</div>`;
    } else if (images.length) {
      show = `<div class="showcase">${carousel(p, images)}</div>`;
    }
    const buttons = links.length
      ? `<p class="project__links">${links.map((v) => `<a class="btn btn--sm" ${linkAttrs(v.url)}>${icon('play')}<span>${tx(v.label || 'Ver video')}</span></a>`).join('')}</p>`
      : '';
    return show + buttons;
  };

  const renderLink = (l) => {
    if (!has(l.url) || isPending(l.url)) {
      return `<span class="pending">[PENDIENTE] link: ${esc(l.label)}</span>`;
    }
    return `<a class="btn btn--sm" ${linkAttrs(l.url)}>${icon(l.icon)}<span>${tx(l.label)}</span></a>`;
  };

  const renderProject = (p, i) => `
      <li>
        <article class="project" id="proyecto-${esc(p.id)}" data-id="${esc(p.id)}" data-tone="${toneOf(p.color)}" style="--bg:${color(p.color)}" aria-labelledby="p-${esc(p.id)}-title">
          ${has(p.sticker) ? `<p class="sticker project__sticker"><span class="sticker__dot" aria-hidden="true"></span>${tx(p.sticker)}</p>` : ''}
          <div class="project__media">${renderMedia(p)}</div>
          <div class="project__body">
            <p class="project__meta"><span class="ep">EP. ${pad(i + 1)}</span><span>${tx(p.period)}</span></p>
            <h3 class="project__name" id="p-${esc(p.id)}-title">${tx(p.name)}</h3>
            ${has(p.role) ? `<p class="project__role">${tx(p.role)}</p>` : ''}
            ${has(p.summary) ? `<p class="project__summary">${tx(p.summary)}</p>` : ''}
            ${has(p.highlights) ? `<ul class="ticks">${p.highlights.map((h) => `<li>${tx(h)}</li>`).join('')}</ul>` : ''}
            ${has(p.results) ? `
              <div class="project__results">
                <h4>Resultados</h4>
                <ul class="ticks">${p.results.map((r) => `<li>${tx(r)}</li>`).join('')}</ul>
              </div>` : ''}
            ${has(p.links) ? `<div class="project__links">${p.links.map(renderLink).join('')}</div>` : ''}
          </div>
        </article>
      </li>`;

  const renderProjects = ({ projects }) => {
    const el = section('proyectos', has(projects?.items));
    if (!el) return;
    el.innerHTML = `
      <div class="container">
        ${head('proyectos', projects)}
        <ol class="projects">${projects.items.map(renderProject).join('')}</ol>
      </div>`;
  };

  const renderTools = ({ tools }) => {
    const el = section('herramientas', has(tools?.items));
    if (!el) return;
    el.innerHTML = `
      <div class="container">
        ${head('herramientas', tools)}
        <ul class="chips tools">${tools.items.map((t) => `<li>${tx(t)}</li>`).join('')}</ul>
      </div>`;
  };

  const renderTestimonials = ({ testimonials }) => {
    const el = section('testimonios', has(testimonials?.items));
    if (!el) return;
    el.innerHTML = `
      <div class="container">
        ${head('testimonios', testimonials)}
        <ul class="quotes">
          ${testimonials.items.map((q) => `
            <li>
              <figure class="quote">
                <blockquote><p>${tx(q.quote)}</p></blockquote>
                <figcaption>${tx(q.name)}${has(q.role) ? `<span>${tx(q.role)}</span>` : ''}</figcaption>
              </figure>
            </li>`).join('')}
        </ul>
      </div>`;
  };

  const renderContact = ({ contact, cv }) => {
    const el = section('contacto', true);
    el.classList.add('contact');
    el.innerHTML = `
      <div class="container">
        ${head('contacto', contact)}
        <ul class="channels">
          ${(contact.channels || []).map((ch) => `
            <li>
              <a class="channel" style="--c:${color(ch.color)}" ${linkAttrs(ch.url)}>
                <span class="channel__icon">${icon(ch.icon)}</span>
                <span class="channel__text">
                  <span class="channel__label">${tx(ch.label)}</span>
                  <span class="channel__value">${tx(ch.value)}</span>
                </span>
                ${icon('arrow')}
              </a>
            </li>`).join('')}
        </ul>
        <div class="contact__cv">
          ${has(contact.cvNote) ? `<p class="contact__note">${tx(contact.cvNote)}</p>` : ''}
          ${cvButton(cv, 'btn--turq btn--xl')}
        </div>
      </div>`;
  };

  const renderFooter = ({ person, footer, contact }) => {
    const year = new Date().getFullYear();
    const social = (contact.channels || []).map((ch) => `<li><a ${linkAttrs(ch.url)}>${esc(ch.label)}</a></li>`).join('');
    $('#footer').innerHTML = `
      <div class="container site-footer__inner">
        <div>
          <p class="site-footer__brand">${esc(person.name)}</p>
          <p>© ${year} · ${tx(footer.place)}</p>
        </div>
        <ul class="site-footer__links">
          ${social}
          <li><a href="#inicio">${tx(footer.backToTop)} ↑</a></li>
        </ul>
      </div>`;
  };

  // El menú se arma al final, para no mostrar links a secciones ocultas
  const renderNav = ({ nav, person, cv }) => {
    $('[data-slot="brand"]').textContent = person.shortName || person.name;
    $('#nav-list').innerHTML = (nav || [])
      .filter((n) => { const target = document.querySelector(n.href); return target && !target.hidden; })
      .map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`)
      .join('');

    const headerCv = $('.site-header [data-cv]');
    headerCv.href = cv.file;
    headerCv.download = cv.downloadName;
    $('[data-slot="cv-label"]').textContent = cv.label;
    $('[data-slot="cv-label-short"]').textContent = cv.labelShort || 'CV';
    headerCv.setAttribute('aria-label', cv.label);
  };

  const setupMenu = () => {
    const btn = $('.nav-toggle');
    const nav = $('#main-nav');
    const label = $('.visually-hidden', btn);
    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      label.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    };
    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    });
  };

  const showError = (err) => {
    const fromFile = location.protocol === 'file:';
    $('#main').innerHTML = `
      <div class="load-error" role="alert">
        <p><strong>No se pudo cargar el contenido del sitio.</strong></p>
        <p>${fromFile
          ? 'Abriste el archivo con doble clic. Para verlo, usá <code>abrir-sitio.bat</code> (está explicado en LEEME.md).'
          : 'Revisá <code>content.json</code>: seguramente falta una coma, unas comillas o una llave.'}</p>
        <p><small>Detalle técnico: ${esc(err.message)}</small></p>
      </div>`;
  };

  /* ---------- Movimiento ---------- */

  const canAnimate = () => !reduceMotion.matches && 'IntersectionObserver' in window;

  // Qué aparece suave al hacer scroll. Los elementos del mismo tipo
  // dentro de una sección entran escalonados.
  const REVEAL = [
    '.hero__text > *', '.hero__visual', '.section-head', '.stat',
    '.about__text > p', '.about__facts', '.about__visual', '.service',
    '.project', '.tools li', '.quote', '.channel', '.contact__cv',
  ];

  const setupReveal = () => {
    if (!canAnimate()) return;
    document.documentElement.classList.add('js-motion');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    REVEAL.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        const scope = el.closest('section') || document;
        const index = [...scope.querySelectorAll(sel)].indexOf(el);
        el.style.setProperty('--d', `${Math.min(index, 5) * 90}ms`);
        el.dataset.reveal = '';
        // Al terminar se limpia, así los hover no heredan la demora
        el.addEventListener('transitionend', (ev) => {
          if (ev.target !== el || ev.propertyName !== 'transform' || !el.classList.contains('is-visible')) return;
          el.removeAttribute('data-reveal');
          el.style.removeProperty('--d');
        });
        io.observe(el);
      });
    });
  };

  // Los números cuentan desde 0 cuando aparecen en pantalla
  const setupCounters = () => {
    if (!canAnimate()) return;
    const withDots = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    document.querySelectorAll('[data-count]').forEach((el) => {
      const final = el.textContent;
      const found = [...final.matchAll(/\d{1,3}(?:\.\d{3})+|\d+/g)];
      if (!found.length) return;
      const m = found[found.length - 1];
      const target = Number(m[0].replace(/\./g, ''));
      const before = final.slice(0, m.index);
      const after = final.slice(m.index + m[0].length);
      el.textContent = `${before}0${after}`;

      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1800;
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = p < 1 ? `${before}${withDots(Math.round(target * eased))}${after}` : final;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.6 });
      io.observe(el);
    });
  };

  // Header con línea al bajar + barrita de progreso de lectura
  const setupHeader = () => {
    const header = $('.site-header');
    const bar = $('.scroll-progress');
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle('is-scrolled', y > 8);
      bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  };

  /* ---------- Carruseles, celulares y vista ampliada ---------- */

  const scrollBehavior = () => (reduceMotion.matches ? 'auto' : 'smooth');

  // Controla un carrusel: flechas, puntitos, contador, teclado y (en reels) el efecto del medio
  const setupSlider = (root) => {
    const track = $('[data-track]', root);
    const slides = [...track.children];
    const dots = [...root.querySelectorAll('.carousel__dot')];
    const count = $('.carousel__count', root);
    const prev = $('[data-dir="-1"]', root);
    const next = $('[data-dir="1"]', root);
    const coverflow = root.hasAttribute('data-coverflow');
    let index = -1;

    const centerOf = (el) => el.offsetLeft + el.offsetWidth / 2;
    const nearest = () => {
      const c = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      slides.forEach((s, k) => { if (Math.abs(centerOf(s) - c) < Math.abs(centerOf(slides[best]) - c)) best = k; });
      return best;
    };
    const go = (k) => {
      const s = slides[Math.max(0, Math.min(slides.length - 1, k))];
      track.scrollTo({ left: centerOf(s) - track.clientWidth / 2, behavior: scrollBehavior() });
    };
    const update = () => {
      if (coverflow) {
        const c = track.scrollLeft + track.clientWidth / 2;
        slides.forEach((s) => {
          const d = Math.min(Math.abs(centerOf(s) - c) / s.offsetWidth, 2);
          s.style.setProperty('--scale', (1 - d * 0.14).toFixed(3));
          s.style.setProperty('--fade', (1 - d * 0.4).toFixed(3));
        });
      }
      const k = nearest();
      if (k === index) return;
      index = k;
      slides.forEach((s, j) => s.classList.toggle('is-active', j === k));
      dots.forEach((d, j) => d.classList.toggle('is-active', j === k));
      if (count) count.textContent = `${k + 1} / ${slides.length}`;
      if (prev) prev.disabled = k === 0;
      if (next) next.disabled = k === slides.length - 1;
    };

    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    track.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    root.querySelectorAll('[data-dir]').forEach((b) => b.addEventListener('click', () => go(index + Number(b.dataset.dir))));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });
    // En reels se arranca centrado en el primero
    if (coverflow) track.scrollLeft = centerOf(slides[0]) - track.clientWidth / 2;
    update();
    root.slider = { go, get index() { return index; } };
  };

  // En compu, al pasar el mouse por un celular se reproduce una vista previa muda
  const setupPhones = () => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    document.querySelectorAll('.phone').forEach((ph) => {
      const v = $('video', ph);
      ph.addEventListener('pointerenter', () => {
        if (!canHover.matches || reduceMotion.matches) return;
        if (ph.closest('.reels__slide:not(.is-active)')) return;
        v.play().then(() => ph.classList.add('is-previewing')).catch(() => {});
      });
      ph.addEventListener('pointerleave', () => { v.pause(); ph.classList.remove('is-previewing'); });
    });
  };

  // Vista ampliada (imágenes y videos), con flechas, teclado y deslizar con el dedo
  const lightbox = (() => {
    let dlg; let stage; let caption; let count; let items = []; let i = 0; let trigger = null;

    const show = (n, dir = 0) => {
      if (n < 0 || n >= items.length) return;
      i = n;
      const it = items[i];
      stage.style.setProperty('--dir', dir);
      stage.innerHTML = it.type === 'video'
        ? `<video class="lightbox__media lightbox__media--video" controls autoplay playsinline${it.poster ? ` poster="${esc(it.poster)}"` : ''}><source src="${esc(it.src)}" type="${videoType(it.src)}"></video>`
        : `<img class="lightbox__media" src="${esc(it.src)}" alt="${esc(it.alt)}" width="${Number(it.width) || 1600}" height="${Number(it.height) || 1000}">`;
      caption.textContent = it.type === 'video' ? it.label || '' : it.alt || '';
      count.textContent = items.length > 1 ? `${i + 1} / ${items.length}` : '';
      dlg.querySelectorAll('[data-step]').forEach((b) => {
        const to = i + Number(b.dataset.step);
        b.hidden = items.length < 2;
        b.disabled = to < 0 || to >= items.length;
      });
    };

    const build = () => {
      dlg = document.createElement('dialog');
      dlg.className = 'lightbox';
      dlg.setAttribute('aria-label', 'Vista ampliada');
      dlg.innerHTML = `
        <div class="lightbox__stage"></div>
        <div class="lightbox__bar"><p class="lightbox__caption"></p><span class="lightbox__count"></span></div>
        <button class="round-btn lightbox__close" type="button" aria-label="Cerrar">${icon('close')}</button>
        <button class="round-btn lightbox__nav lightbox__nav--prev" type="button" data-step="-1" aria-label="Anterior">${icon('chevronLeft')}</button>
        <button class="round-btn lightbox__nav lightbox__nav--next" type="button" data-step="1" aria-label="Siguiente">${icon('chevronRight')}</button>`;
      document.body.append(dlg);
      stage = $('.lightbox__stage', dlg);
      caption = $('.lightbox__caption', dlg);
      count = $('.lightbox__count', dlg);

      $('.lightbox__close', dlg).addEventListener('click', () => dlg.close());
      dlg.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => show(i + Number(b.dataset.step), Number(b.dataset.step))));
      dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target === stage) dlg.close(); });
      dlg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') show(i + 1, 1);
        if (e.key === 'ArrowLeft') show(i - 1, -1);
      });
      dlg.addEventListener('close', () => {
        stage.innerHTML = '';
        document.documentElement.classList.remove('has-lightbox');
        trigger?.focus({ preventScroll: true });
      });
      // Deslizar con el dedo sobre una imagen
      let x0 = null;
      stage.addEventListener('pointerdown', (e) => { x0 = e.target.tagName === 'IMG' ? e.clientX : null; });
      stage.addEventListener('pointerup', (e) => {
        if (x0 === null) return;
        const dx = e.clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      });
    };

    return {
      open(list, n, from) {
        if (!dlg) build();
        items = list;
        trigger = from;
        document.querySelectorAll('.phone video').forEach((v) => v.pause());
        show(n);
        dlg.showModal();
        document.documentElement.classList.add('has-lightbox');
      },
    };
  })();

  const setupShowcases = () => {
    document.querySelectorAll('[data-slider]').forEach(setupSlider);
    setupPhones();

    document.addEventListener('click', (e) => {
      const zoom = e.target.closest('[data-zoom]');
      const play = e.target.closest('[data-play]');
      if (!zoom && !play) return;
      const media = MEDIA.get(e.target.closest('.project').dataset.id);

      if (zoom) {
        if (!$('.frame', zoom.parentElement).classList.contains('is-loaded')) return;
        lightbox.open(media.images.map((img) => ({ ...img, type: 'image' })), Number(zoom.dataset.zoom), zoom);
        return;
      }
      // En los reels, tocar uno de costado lo trae al centro
      const slide = play.closest('.reels__slide');
      if (slide && !slide.classList.contains('is-active')) {
        slide.closest('[data-slider]').slider.go([...slide.parentElement.children].indexOf(slide));
        return;
      }
      lightbox.open(media.videos.map((v) => ({ ...v, type: 'video' })), Number(play.dataset.play), play);
    });
  };

  /* ---------- Arranque ---------- */

  const render = (c) => {
    renderHero(c);
    renderMarquee(c);
    renderStats(c);
    renderAbout(c);
    renderServices(c);
    renderProjects(c);
    renderTools(c);
    renderTestimonials(c);
    renderContact(c);
    renderFooter(c);
    renderNav(c);
    watchImages(document);
    setupShowcases();
    setupReveal();
    setupCounters();
    setupHeader();
  };

  setupMenu();

  fetch('content.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error(`content.json respondió ${r.status}`); return r.json(); })
    .then(render)
    .catch((err) => { console.error(err); showError(err); });
})();
