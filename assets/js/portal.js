/* Comportamentos partilhados pelas páginas públicas. */

(function () {
  'use strict';

  /* Limpeza única solicitada para reiniciar a demonstração do fluxo de visitas. */
  var visitResetVersion = '20260804-new-visit-flow';
  if (window.localStorage.getItem('espacon_visit_reset_version') !== visitResetVersion) {
    window.localStorage.removeItem('espacon_visit_requests');
    window.localStorage.removeItem('espacon_owner_proposals');
    window.localStorage.removeItem('espacon_pending_activation');
    window.localStorage.setItem('espacon_visit_reset_version', visitResetVersion);
  }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Menu de navegação em ecrãs pequenos. */
  function setupNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('siteNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('i').className = open ? 'bx bx-x' : 'bx bx-menu';
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName !== 'A') return;
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('i').className = 'bx bx-menu';
    });
  }

  /* Sombra no cabeçalho assim que a página sai do topo. */
  function setupStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Rotação das imagens do destaque. */
  function setupHero() {
    var slides = document.querySelectorAll('.hero__slide');
    var dots = document.querySelectorAll('.hero__dots button');
    if (slides.length < 2) return;

    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', String(i === current));
      });
    }

    function play() {
      window.clearInterval(timer);
      if (reducedMotion.matches) return;
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide));
        play();
      });
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) window.clearInterval(timer);
      else play();
    });

    play();
  }

  /* Entrada progressiva dos blocos ao rolar. */
  function setupReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('is-in');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, index) {
          if (!entry.isIntersecting) return;
          window.setTimeout(function () {
            entry.target.classList.add('is-in');
          }, index * 70);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* Guarda o espaço na conta do cliente e abre a área de favoritos. */
  function setupFavourites() {
    var buttons = document.querySelectorAll('.favorite');
    if (!buttons.length) return;

    var session = JSON.parse(window.localStorage.getItem('espacon_session') || 'null');
    var allFavourites = JSON.parse(window.localStorage.getItem('espacon_favorites') || '{}');
    var current = session && session.role === 'client' ? (allFavourites[session.userId] || []) : [];
    buttons.forEach(function (button) {
      var detailsLink = button.closest('.venue-card') && button.closest('.venue-card').querySelector('a[href*="detalhes-salao.html?id="]');
      var venueId = button.dataset.venueId || (detailsLink ? new URL(detailsLink.href).searchParams.get('id') : '');
      if (!venueId) return;
      if (current.includes(venueId)) { button.setAttribute('aria-pressed', 'true'); button.classList.add('is-saved'); button.querySelector('i').className = 'bx bxs-heart'; }
      button.addEventListener('click', function () {
        venueId = button.dataset.venueId || venueId;
        button.setAttribute('aria-pressed', 'true');
        button.classList.add('is-saved');
        button.querySelector('i').className = 'bx bxs-heart';
        if (session && session.role === 'client') {
          if (!current.includes(venueId)) current.push(venueId);
          allFavourites[session.userId] = current;
          window.localStorage.setItem('espacon_favorites', JSON.stringify(allFavourites));
          window.location.href = 'dashboard-cliente.html#favoritos';
        } else {
          window.localStorage.setItem('espacon_pending_favorite', venueId);
          window.location.href = '../auth/login.html?next=favoritos';
        }
      });
    });
  }

  /* Aviso flutuante reutilizado pelas várias páginas. */
  var toastTimer;

  function toast(message) {
    var element = document.getElementById('toast');
    if (!element) return;

    element.textContent = message;
    element.classList.add('is-visible');

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      element.classList.remove('is-visible');
    }, 3600);
  }

  window.EspacoOn = { toast: toast };

  document.addEventListener('DOMContentLoaded', function () {
    setupNav();
    setupStickyHeader();
    setupHero();
    setupReveal();
    setupFavourites();
  });
})();
