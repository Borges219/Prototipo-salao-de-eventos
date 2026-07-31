/* Estrutura das páginas internas: barra lateral e avisos flutuantes. */

(function () {
  'use strict';

  function setupSidebar() {
    var sidebar = document.getElementById('sidebar');
    var toggle = document.getElementById('menuToggle');
    var backdrop = document.getElementById('backdrop');
    if (!sidebar || !toggle) return;

    function close() {
      sidebar.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-visible');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = sidebar.classList.toggle('is-open');
      if (backdrop) backdrop.classList.toggle('is-visible', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    sidebar.querySelectorAll('nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 900) close();
      });
    });
  }

  var toastTimer;

  function toast(message) {
    var element = document.getElementById('toast');
    if (!element) return;

    element.textContent = message;
    element.classList.add('is-visible');

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      element.classList.remove('is-visible');
    }, 3200);
  }

  window.EspacoOn = { toast: toast };

  document.addEventListener('DOMContentLoaded', setupSidebar);
})();
