/* Gestão dos pedidos de visita recebidos pelo proprietário do salão.
   Os pedidos chegam do formulário da página de detalhe através do localStorage. */

document.addEventListener('DOMContentLoaded', function () {
  var STORAGE_KEY = 'espacon_visit_requests';

  var STATUS_LABELS = {
    pending: 'Aguardando resposta',
    confirmed: 'Confirmada',
    rescheduled: 'Nova data proposta',
    completed: 'Realizada',
    cancelled: 'Cancelada'
  };

  var STATUS_BADGES = {
    pending: 'badge--warn',
    confirmed: 'badge--ok',
    rescheduled: 'badge--info',
    completed: 'badge--info',
    cancelled: 'badge--danger'
  };

  var seed = [
    {
      id: 'VIS-1042',
      venueId: 'acacia',
      venue: 'Salão Acácia',
      ownerId: 'owner-acacia',
      client: 'Luísa Costa',
      phone: '+258 84 245 7810',
      email: 'luisa.costa@email.com',
      date: '2026-08-12',
      time: '10:00',
      guests: 3,
      notes: 'Gostaria de conhecer a área da cerimónia e as opções de decoração.',
      status: 'pending',
      createdAt: '2026-07-31T08:15:00',
      messages: []
    },
    {
      id: 'VIS-1038',
      venueId: 'acacia',
      venue: 'Salão Acácia',
      ownerId: 'owner-acacia',
      client: 'João Mabunda',
      phone: '+258 82 107 4490',
      email: 'joao.mabunda@email.com',
      date: '2026-08-14',
      time: '14:00',
      guests: 2,
      notes: 'Visita para avaliar o espaço de uma gala empresarial.',
      status: 'confirmed',
      createdAt: '2026-07-30T13:20:00',
      messages: [{ author: 'owner', text: 'Visita confirmada. Estaremos à sua espera na receção.' }]
    },
    {
      id: 'VIS-1031',
      venueId: 'acacia',
      venue: 'Salão Acácia',
      ownerId: 'owner-acacia',
      client: 'Ana Nhantumbo',
      phone: '+258 86 335 9021',
      email: 'ana@email.com',
      date: '2026-08-09',
      time: '11:00',
      guests: 4,
      notes: 'Pretendemos organizar uma graduação para cerca de 200 convidados.',
      status: 'rescheduled',
      createdAt: '2026-07-29T10:00:00',
      messages: [{ author: 'owner', text: 'Propusemos o dia 9 de Agosto às 11:00. Aguardamos a sua confirmação.' }]
    }
  ];

  var list = document.getElementById('visitList');
  var detail = document.getElementById('visitDetail');
  var search = document.getElementById('visitSearch');
  var filter = document.getElementById('statusFilter');

  var requests = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  if (!requests.length) {
    requests = seed;
    save();
  }
  var selectedId = requests.length ? requests[0].id : null;

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[character];
    });
  }

  function initials(name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0);
      })
      .join('')
      .toUpperCase();
  }

  function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value + 'T12:00:00'));
  }

  function countBy(status) {
    return requests.filter(function (request) {
      return request.status === status;
    }).length;
  }

  function renderMetrics() {
    document.getElementById('metricPending').textContent = countBy('pending');
    document.getElementById('metricConfirmed').textContent = countBy('confirmed');
    document.getElementById('metricRescheduled').textContent = countBy('rescheduled');
    document.getElementById('metricCompleted').textContent = countBy('completed');
    document.getElementById('navPendingCount').textContent = countBy('pending');
  }

  function statusBadge(status) {
    return '<span class="badge ' + STATUS_BADGES[status] + '">' + STATUS_LABELS[status] + '</span>';
  }

  function renderList() {
    var term = search.value.trim().toLowerCase();
    var state = filter.value;

    var visible = requests.filter(function (request) {
      var matchesState = state === 'all' || request.status === state;
      var matchesTerm = (request.client + ' ' + request.venue).toLowerCase().indexOf(term) !== -1;
      return matchesState && matchesTerm;
    });

    if (!visible.length) {
      list.innerHTML = '<p class="list-empty">Nenhuma solicitação encontrada.</p>';
      return;
    }

    list.innerHTML = visible
      .map(function (request) {
        return [
          '<button class="visit-item" type="button" data-id="' + request.id + '"',
          ' aria-current="' + (request.id === selectedId) + '">',
          '  <span class="avatar">' + initials(request.client) + '</span>',
          '  <span class="visit-item__copy">',
          '    <strong>' + escapeHtml(request.client) + '</strong>',
          '    <span>' + escapeHtml(request.venue) + '</span>',
          '    <small><i class="bx bx-calendar"></i> ' + formatDate(request.date) + ' · ' + escapeHtml(request.time) + ' · ' + request.guests + ' visitante(s)</small>',
          '  </span>',
          '  <span class="visit-item__side">',
          '    ' + statusBadge(request.status),
          '    <time>' + escapeHtml(request.id) + '</time>',
          '  </span>',
          '</button>'
        ].join('');
      })
      .join('');

    list.querySelectorAll('[data-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        selectedId = button.dataset.id;
        render();
      });
    });
  }

  function renderDetail() {
    var request = requests.find(function (item) {
      return item.id === selectedId;
    });

    if (!request) {
      detail.innerHTML =
        '<div class="detail-empty"><i class="bx bx-calendar"></i><h3>Seleccione uma solicitação</h3>' +
        '<p>Os dados do cliente, horário e acções aparecerão aqui.</p></div>';
      return;
    }

    var history = request.messages && request.messages.length
      ? '<div class="message-log">' +
        request.messages
          .map(function (message) {
            var author = message.author === 'owner' ? 'Proprietário' : 'Cliente';
            return '<p><strong>' + author + ':</strong> ' + escapeHtml(message.text) + '</p>';
          })
          .join('') +
        '</div>'
      : '';

    detail.innerHTML = [
      '<div class="detail-head">',
      '  <div>',
      '    <span class="eyebrow">' + escapeHtml(request.id) + '</span>',
      '    <h3>' + escapeHtml(request.client) + '</h3>',
      '    <p>Pedido para ' + escapeHtml(request.venue) + '</p>',
      '  </div>',
      '  ' + statusBadge(request.status),
      '</div>',

      '<section class="detail-block">',
      '  <h4>Dados da visita</h4>',
      '  <div class="detail-data">',
      '    <div><small>Data</small><strong>' + formatDate(request.date) + '</strong></div>',
      '    <div><small>Horário</small><strong>' + escapeHtml(request.time) + '</strong></div>',
      '    <div><small>Visitantes</small><strong>' + request.guests + ' pessoa(s)</strong></div>',
      '    <div><small>Salão</small><strong>' + escapeHtml(request.venue) + '</strong></div>',
      '  </div>',
      '</section>',

      '<section class="detail-block">',
      '  <h4>Contacto do cliente</h4>',
      '  <div class="contact-lines">',
      '    <span><i class="bx bx-phone"></i>' + escapeHtml(request.phone) + '</span>',
      '    <span><i class="bx bx-envelope"></i>' + escapeHtml(request.email) + '</span>',
      '  </div>',
      '</section>',

      '<section class="detail-block">',
      '  <h4>Observações</h4>',
      '  <p class="client-note">' + escapeHtml(request.notes || 'Sem observações adicionais.') + '</p>',
      '  ' + history,
      '</section>',

      '<div class="detail-actions">',
      request.status === 'pending'
        ? '  <button class="btn btn--primary" type="button" data-action="confirm"><i class="bx bx-check"></i> Confirmar visita</button>'
        : '',
      '  <button class="btn btn--outline" type="button" data-action="reschedule"><i class="bx bx-calendar-edit"></i> Propor nova data</button>',
      '  <button class="btn btn--outline" type="button" data-action="message"><i class="bx bx-message-rounded-dots"></i> Enviar mensagem</button>',
      request.status === 'confirmed'
        ? '  <button class="btn btn--navy" type="button" data-action="complete">Marcar como realizada</button>'
        : '',
      '  <button class="btn btn--danger" type="button" data-action="cancel">Cancelar</button>',
      '</div>',

      '<form class="inline-form" id="rescheduleForm">',
      '  <input id="newDate" type="date" required aria-label="Nova data">',
      '  <input id="newTime" type="time" required aria-label="Novo horário">',
      '  <textarea id="rescheduleMessage" rows="2" placeholder="Mensagem sobre a alteração"></textarea>',
      '  <button class="btn btn--primary" type="submit">Enviar nova proposta</button>',
      '</form>',

      '<form class="inline-form" id="messageForm">',
      '  <textarea id="ownerMessage" rows="3" placeholder="Escreva uma mensagem para o cliente" required></textarea>',
      '  <button class="btn btn--primary" type="submit">Enviar mensagem</button>',
      '</form>'
    ].join('');

    bindActions(request);
  }

  function bindActions(request) {
    detail.querySelectorAll('[data-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        var action = button.dataset.action;

        if (action === 'confirm') {
          request.status = 'confirmed';
          addMessage(request, 'Visita confirmada para ' + formatDate(request.date) + ' às ' + request.time + '.');
          commit('Visita confirmada e cliente notificado.');
        } else if (action === 'complete') {
          request.status = 'completed';
          commit('Visita marcada como realizada.');
        } else if (action === 'cancel') {
          if (!window.confirm('Deseja cancelar esta visita?')) return;
          request.status = 'cancelled';
          addMessage(request, 'A visita foi cancelada pelo responsável do salão.');
          commit('Visita cancelada.');
        } else {
          var target = document.getElementById(action === 'reschedule' ? 'rescheduleForm' : 'messageForm');
          detail.querySelectorAll('.inline-form').forEach(function (form) {
            form.classList.toggle('is-open', form === target && !target.classList.contains('is-open'));
          });
        }
      });
    });

    document.getElementById('rescheduleForm').addEventListener('submit', function (event) {
      event.preventDefault();
      request.date = document.getElementById('newDate').value;
      request.time = document.getElementById('newTime').value;
      request.status = 'rescheduled';
      addMessage(request, document.getElementById('rescheduleMessage').value || 'Foi proposta uma nova data para a visita.');
      commit('Nova data enviada ao cliente.');
    });

    document.getElementById('messageForm').addEventListener('submit', function (event) {
      event.preventDefault();
      addMessage(request, document.getElementById('ownerMessage').value);
      commit('Mensagem enviada ao cliente.');
    });
  }

  function addMessage(request, text) {
    request.messages = request.messages || [];
    request.messages.push({ author: 'owner', text: text, at: new Date().toISOString() });
  }

  function commit(message) {
    save();
    render();
    window.EspacoOn.toast(message);
  }

  function render() {
    renderMetrics();
    renderList();
    renderDetail();
  }

  search.addEventListener('input', renderList);
  filter.addEventListener('change', renderList);

  render();
});
