/* Estrutura das páginas internas: barra lateral e avisos flutuantes. */

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

  function setupLogout() {
    document.querySelectorAll('[data-logout]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.localStorage.removeItem('espacon_session');
        window.location.href = '../auth/login.html';
      });
    });
  }

  function setupPasswordToggles() {
    document.querySelectorAll('input[type="password"], #ownerForm input[name="password"]').forEach(function (input, index) {
      input.type = 'password';
      if (!input.id) input.id = 'securePasswordField' + index;
      if (input.parentElement.querySelector('[data-toggle-password="' + input.id + '"]')) return;
      input.parentElement.classList.add('password-field');
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.dataset.togglePassword = input.id;
      toggle.setAttribute('aria-label', 'Mostrar palavra-passe');
      toggle.innerHTML = '<i class="bx bx-show"></i>';
      input.insertAdjacentElement('afterend', toggle);
    });
    document.querySelectorAll('[data-toggle-password]').forEach(function (button) {
      var input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      button.addEventListener('click', function () {
        var hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        button.setAttribute('aria-label', hidden ? 'Esconder palavra-passe' : 'Mostrar palavra-passe');
        button.querySelector('i').className = hidden ? 'bx bx-hide' : 'bx bx-show';
      });
    });
  }

  function setupListPagination() {
    var targets = [
      ['visitList', '.visit-item'], ['clientVisitList', '.visit-item'],
      ['ownerClients', '.owner-client-table__row'], ['ownerReservations', '.owner-data-table__row'],
      ['ownerAgenda', '.owner-record'], ['ownerAgendaBlocks', '.owner-record'], ['ownerVenues', '.owner-record'],
      ['ownerMessages', '.owner-record'], ['ownerProposals', '.owner-record'], ['ownerPayments', '.owner-record'],
      ['clientMessages', '.client-row'], ['clientReservations', '.client-row'], ['clientPayments', '.client-row'],
      ['clientFavoriteGrid', '.venue-card'], ['clientVenueGrid', '.venue-card'],
      ['ownersRows', '.owner-record'], ['venuesRows', '.owner-record'], ['clientsRows', '.owner-record'],
      ['visitsRows', '.owner-record'], ['financeRows', '.owner-record'], ['adminActivity', '.owner-record'], ['adminRecent', '.owner-record']
    ];
    var pageSize = 6;
    var scheduled = false;

    function applyPagination(container, itemSelector) {
      var items = Array.from(container.querySelectorAll(itemSelector));
      var navId = 'pagination-' + container.id;
      var nav = document.getElementById(navId);
      if (items.length <= pageSize) {
        items.forEach(function (item) { item.style.display = ''; });
        if (nav) nav.remove();
        container.dataset.page = '1';
        return;
      }
      var pages = Math.ceil(items.length / pageSize);
      var page = Math.min(Math.max(Number(container.dataset.page) || 1, 1), pages);
      container.dataset.page = String(page);
      items.forEach(function (item, index) { item.style.display = index < (page - 1) * pageSize || index >= page * pageSize ? 'none' : ''; });
      if (!nav) {
        nav = document.createElement('nav');
        nav.id = navId;
        nav.className = 'list-pagination';
        nav.setAttribute('aria-label', 'Paginação da lista');
        container.insertAdjacentElement('afterend', nav);
      }
      var signature = pages + ':' + page;
      if (nav.dataset.signature === signature) return;
      nav.dataset.signature = signature;
      var numbers = Array.from({ length: pages }, function (_, index) { var number=index+1;return '<button type="button" data-page="'+number+'" aria-current="'+(number===page?'page':'false')+'">'+number+'</button>'; }).join('');
      nav.innerHTML = '<button type="button" data-page="'+(page-1)+'" '+(page===1?'disabled':'')+' aria-label="Página anterior"><i class="bx bx-chevron-left"></i></button>'+numbers+'<button type="button" data-page="'+(page+1)+'" '+(page===pages?'disabled':'')+' aria-label="Página seguinte"><i class="bx bx-chevron-right"></i></button>';
      nav.querySelectorAll('[data-page]').forEach(function (button) { button.addEventListener('click', function () { container.dataset.page=button.dataset.page;applyPagination(container,itemSelector);container.scrollIntoView({behavior:'smooth',block:'start'}); }); });
    }

    function refresh() {
      scheduled = false;
      targets.forEach(function (target) { var container=document.getElementById(target[0]);if(container)applyPagination(container,target[1]); });
    }
    function schedule() { if(scheduled)return;scheduled=true;window.requestAnimationFrame(refresh); }
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    schedule();
    window.EspacoOnPaginate = schedule;
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

  document.addEventListener('DOMContentLoaded', function () {
    setupSidebar();
    setupLogout();
    setupPasswordToggles();
    setupListPagination();
  });
})();
