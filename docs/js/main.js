/* =========================================================================
   Portfólio — Gabriel Reginaldo Teodoro dos Santos
   JavaScript puro (ES6+). Nenhuma biblioteca externa.

   1. Tema claro/escuro persistente
   2. Menu mobile
   3. Cabeçalho fixo + barra de progresso
   4. Scroll spy do menu
   5. Animação de entrada das seções
   6. Filtro de projetos por categoria
   7. Galeria em lightbox
   8. Ano do rodapé
   ========================================================================= */

(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------- 1. TEMA */
  const THEME_KEY = 'gt-portfolio-theme';
  const root = document.documentElement;

  /** Lê o tema salvo; cai na preferência do sistema na primeira visita. */
  const readTheme = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) { /* localStorage bloqueado: segue com a preferência do sistema */ }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f6f9' : '#0b0e14');
  };

  applyTheme(readTheme());

  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* ignora */ }
    });
  }

  /* ------------------------------------------------- 2. MENU MOBILE */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navScrim = $('#navScrim');

  const setNav = (open) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (navScrim) navScrim.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (navScrim) navScrim.addEventListener('click', () => setNav(false));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setNav(false)));

  /* ------------------------------------------------- 3. HEADER + PROGRESSO */
  const header = $('#siteHeader');
  const progressBar = $('#progressBar');

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 8);

    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      progressBar.style.width = pct.toFixed(2) + '%';
    }
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------- 4. SCROLL SPY */
  const navLinks = $$('#nav a[href^="#"]');
  const sections = navLinks
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((s) => spy.observe(s));
  }

  /* ------------------------------------------------- 5. REVEAL */
  const revealables = $$('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------- 6. FILTRO DE PROJETOS */
  const filters = $$('.filter');
  const groups = $$('.group');
  const cards = $$('.card[data-cat]');

  const applyFilter = (value) => {
    cards.forEach((card) => {
      card.hidden = value !== 'all' && card.dataset.cat !== value;
    });

    groups.forEach((group) => {
      const hide = value !== 'all' && group.dataset.group !== value;
      group.hidden = hide;
      // Listas compactas pertencem ao grupo: somem junto com ele.
      if (!hide) {
        const open = group.querySelector('.more');
        if (open && value !== 'all') open.open = false;
      }
    });

    filters.forEach((btn) => {
      const on = btn.dataset.filter === value;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  };

  filters.forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  /* ------------------------------------------------- 7. LIGHTBOX */
  const GALLERIES = {
    valle: [
      { src: 'img/projetos/valle-leads.webp', cap: 'Protótipo das telas de acesso: área do colaborador e cadastro do cliente na vitrine pública.' },
      { src: 'img/projetos/valle-der.webp',   cap: 'Diagrama entidade-relacionamento do banco — modelo que sustenta leads, equipes, lojas, negociações e a vitrine de veículos.' }
    ],
    clay: [
      { src: 'img/projetos/clay-estoque.webp',  cap: 'Gestão de estoque multi-loja, com alerta de estoque mínimo e zerado por filial.' },
      { src: 'img/projetos/clay-produtos.webp', cap: 'Cadastro de produtos importados, com categoria, preço e controle por filial.' },
      { src: 'img/projetos/clay-chatbot.webp',  cap: 'Painel do chatbot de WhatsApp: fluxos de atendimento e respostas automáticas.' },
      { src: 'img/projetos/clay-login.webp',    cap: 'Tela de login e gestão de usuários do sistema.' }
    ],
    guardiao: [
      { src: 'img/projetos/guardiao-splash.webp',   cap: 'Tela de abertura do jogo.' },
      { src: 'img/projetos/guardiao-menu.webp',     cap: 'Menu principal em pixel art.' },
      { src: 'img/projetos/guardiao-select.webp',   cap: 'Seleção de Guardião — cada um representa um bioma brasileiro e tem um poder próprio.' },
      { src: 'img/projetos/guardiao-floresta.webp', cap: 'ODS 15 · Vida Terrestre — fase da Floresta. O ataque do jogador é plantar uma semente.' },
      { src: 'img/projetos/guardiao-oceano.webp',   cap: 'ODS 14 · Vida na Água — fase do Oceano, com mecânica de natação.' },
      { src: 'img/projetos/guardiao-cidade.webp',   cap: 'ODS 7 · Energia Limpa — fase da Cidade.' },
      { src: 'img/projetos/guardiao-boss.webp',     cap: 'ODS 13 · Ação Climática — Coração do Mundo, o chefe final.' }
    ]
  };

  const lb = $('#lb');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const lbCount = $('#lbCount');

  let current = [];
  let index = 0;
  let lastFocused = null;

  const render = () => {
    const item = current[index];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = item.cap;
    lbCap.textContent = item.cap;
    lbCount.textContent = `${index + 1} / ${current.length}`;
    const many = current.length > 1;
    $('#lbPrev').hidden = !many;
    $('#lbNext').hidden = !many;
    lbCount.hidden = !many;
  };

  const openLb = (key, trigger) => {
    const gallery = GALLERIES[key];
    if (!gallery || !lb) return;
    current = gallery;
    index = 0;
    lastFocused = trigger || null;
    render();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  };

  const closeLb = () => {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  const step = (delta) => {
    if (!current.length) return;
    index = (index + delta + current.length) % current.length;
    render();
  };

  $$('.card__zoom').forEach((btn) => {
    btn.addEventListener('click', () => openLb(btn.dataset.gallery, btn));
  });

  if (lb) {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', () => step(-1));
    $('#lbNext').addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  }

  document.addEventListener('keydown', (e) => {
    if (lb && !lb.hidden) {
      if (e.key === 'Escape') { closeLb(); return; }
      if (e.key === 'ArrowLeft') { step(-1); return; }
      if (e.key === 'ArrowRight') { step(1); return; }
      // Mantém o foco dentro do diálogo.
      if (e.key === 'Tab') {
        const focusables = $$('button:not([hidden])', lb);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }

    if (e.key === 'Escape' && navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      setNav(false);
      navToggle.focus();
    }
  });

  /* ------------------------------------------------- 8. ANO */
  const ano = $('#ano');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
