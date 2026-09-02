/* Gestão dos pedidos de visita recebidos pelo proprietário do salão.
   Os pedidos chegam do formulário da página de detalhe através do localStorage. */

document.addEventListener('DOMContentLoaded', function () {
  var STORAGE_KEY = 'espacon_visit_requests';
  var PROPOSALS_KEY = 'espacon_owner_proposals';
  var routeParams = new URLSearchParams(window.location.search);
  var detailMode = routeParams.get('view') === 'detail';

  var STATUS_LABELS = {
    pending: 'Aguardando resposta',
    confirmed: 'Confirmada',
    rescheduled: 'Nova data proposta',
    completed: 'Realizada',
    cancelled: 'Cancelada',
    rejected: 'Rejeitada'
  };

  var STATUS_BADGES = {
    pending: 'badge--warn',
    confirmed: 'badge--ok',
    rescheduled: 'badge--info',
    completed: 'badge--info',
    cancelled: 'badge--danger',
    rejected: 'badge--danger'
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
  var workspace = document.getElementById('ownerVisitWorkspace');
  var search = document.getElementById('visitSearch');
  var filter = document.getElementById('statusFilter');

  var session = JSON.parse(window.localStorage.getItem('espacon_session') || 'null');
  var allRequests = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  var requests = session && session.role === 'owner' ? allRequests.filter(function (request) { return request.ownerId === session.userId && request.requestType !== 'reservation'; }) : [];
  var proposals = JSON.parse(window.localStorage.getItem(PROPOSALS_KEY) || '[]');
  var selectedId = detailMode ? routeParams.get('visit') : null;
  workspace.classList.add(detailMode ? 'is-detail-only' : 'is-list-only');
  document.getElementById('ownerRequestsHeader').hidden = detailMode;
  document.getElementById('ownerRequestsMetrics').hidden = detailMode;
  document.getElementById('ownerVisitsPageTitle').textContent = detailMode ? 'Detalhes da solicitação' : 'Solicitações de visitas';

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allRequests));
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
  function requestBadge(request) { return request.processStatus === 'cancelled' ? '<span class="badge badge--danger">Processo encerrado</span>' : statusBadge(request.status); }
  function reservationStatusBadge(request) { var proposal=proposals.find(function(item){return item.visitId===request.id;});var started=Boolean(request.eventDetails)||Boolean(proposal)||Boolean(request.reservationStatus)||Boolean(request.paymentStatus)||['interested','proposal_sent','proposal_rejected','awaiting_payment','completed'].includes(request.negotiationStatus);if(!started)return '<span class="badge badge--info">Ainda não iniciada</span>';var cancelled=request.processStatus==='cancelled'||Boolean(request.noInterestReason);if(cancelled)return '<span class="badge badge--danger">Cancelada</span>';if(request.reservationStatus==='confirmed'||request.paymentStatus==='paid'||(proposal&&proposal.paymentStatus==='paid'))return '<span class="badge badge--ok">Confirmada</span>';if((proposal&&proposal.status==='accepted')||request.reservationStatus==='awaiting_payment')return '<span class="badge badge--warn">Aguardando pagamento</span>';return '<span class="badge badge--warn">Em negociação</span>'; }

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
          '<article class="visit-item">',
          '  <code class="visit-item__code">' + escapeHtml(request.id) + '</code>',
          '  <span class="visit-item__client">',
          '  <span class="visit-item__copy">',
          '    <strong>' + escapeHtml(request.client) + '</strong>',
          '    <small><i class="bx bx-calendar"></i> ' + formatDate(request.date) + ' · ' + escapeHtml(request.time) + ' · ' + request.guests + ' visitante(s)</small>',
          '  </span>',
          '  </span>',
          '  <span class="visit-item__venue"><i class="bx bx-building-house"></i>' + escapeHtml(request.venue) + '</span>',
          '  <span class="visit-item__side">',
          '    ' + requestBadge(request),
          '  </span>',
          '  <span class="visit-item__reservation">' + reservationStatusBadge(request) + '</span>',
          '  <span class="visit-item__actions"><button class="btn btn--outline" type="button" data-id="' + request.id + '">Ver detalhes</button></span>',
          '</article>'
        ].join('');
      })
      .join('');

    list.querySelectorAll('[data-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.location.href = 'dashboard-proprietario-visitas.html?view=detail&visit=' + encodeURIComponent(button.dataset.id);
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

    var clientRequests = requests.filter(function (item) {
      if (request.clientId && item.clientId) return item.clientId === request.clientId;
      return String(item.email || '').toLowerCase() === String(request.email || '').toLowerCase() && String(item.phone || '').replace(/\D/g, '') === String(request.phone || '').replace(/\D/g, '');
    }).sort(function (a, b) { return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date); });
    var clientProposalCount = proposals.filter(function (proposal) { return clientRequests.some(function (item) { return item.id === proposal.visitId; }); }).length;
    var clientHistory = clientRequests.map(function (item) {
      return '<button type="button" class="client-process-link" data-client-request="' + escapeHtml(item.id) + '" aria-current="' + (item.id === request.id) + '"><span><strong>' + escapeHtml(item.venue) + '</strong><small>' + formatDate(item.date) + ' · ' + escapeHtml(item.time) + '</small></span>' + requestBadge(item) + '</button>';
    }).join('');

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
      '    <a class="detail-back" href="dashboard-proprietario-visitas.html"><i class="bx bx-left-arrow-alt"></i> Voltar às solicitações</a>',
      '    <span class="eyebrow">' + escapeHtml(request.id) + '</span>',
      '    <h3>' + escapeHtml(request.client) + '</h3>',
      '    <p>Pedido para ' + escapeHtml(request.venue) + '</p>',
      '  </div>',
      '  ' + requestBadge(request),
      '</div>',

      '<section class="detail-block client-dossier">',
      '  <div class="client-dossier__title"><div><span class="eyebrow">Ficha individual</span><h4>Processos de ' + escapeHtml(request.client) + '</h4></div><span class="badge badge--info">' + clientRequests.length + ' pedido(s)</span></div>',
      '  <div class="client-dossier__metrics"><span><small>Visitas</small><strong>' + clientRequests.length + '</strong></span><span><small>Propostas</small><strong>' + clientProposalCount + '</strong></span><span><small>Conta</small><strong>' + escapeHtml(request.clientId || 'Cliente identificado') + '</strong></span></div>',
      '  <div class="client-process-list">' + clientHistory + '</div>',
      '</section>',

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

      request.eventDetails ? '<section class="detail-block"><h4>Interesse do cliente</h4><div class="detail-data"><div><small>Tipo de evento</small><strong>' + escapeHtml(request.eventDetails.type) + '</strong></div><div><small>Data pretendida</small><strong>' + formatDate(request.eventDetails.date) + '</strong></div><div><small>Convidados</small><strong>' + escapeHtml(request.eventDetails.guests) + '</strong></div><div><small>Orçamento</small><strong>' + escapeHtml(request.eventDetails.budget) + '</strong></div></div><p class="client-note">' + escapeHtml(request.eventDetails.notes || 'Sem observações adicionais.') + '</p></section>' : '',
      request.noInterestReason ? '<section class="detail-block"><h4>Processo encerrado pelo cliente</h4><p class="client-rejection"><strong>Cliente sem interesse em avançar.</strong><br>Motivo: ' + escapeHtml(request.noInterestReason) + '</p></section>' : '',
      (function () { var proposal = proposals.find(function (item) { return item.visitId === request.id; }); return proposal ? '<section class="detail-block"><h4>Proposta enviada</h4><div class="detail-data"><div><small>Valor</small><strong>MZN ' + escapeHtml(proposal.amount) + '</strong></div><div><small>Válida até</small><strong>' + (proposal.validUntil ? formatDate(proposal.validUntil) : 'Não definida') + '</strong></div><div><small>Estado</small><strong>' + escapeHtml(proposal.status === 'accepted' ? 'Aceite' : proposal.status === 'rejected' ? 'Rejeitada pelo cliente' : 'Em negociação') + '</strong></div></div><p class="client-note">' + escapeHtml(proposal.services || 'Serviços a definir.') + '</p>' + (proposal.rejectionReason ? '<p class="client-rejection"><strong>Motivo da rejeição:</strong> ' + escapeHtml(proposal.rejectionReason) + '</p>' : '') + '</section>' : ''; })(),

      '<div class="detail-actions">',
      request.status === 'pending'
        ? '  <button class="btn btn--primary" type="button" data-action="confirm"><i class="bx bx-check"></i> Confirmar visita</button>'
        : '',
      request.status === 'pending'
        ? '  <button class="btn btn--danger" type="button" data-action="reject"><i class="bx bx-x"></i> Rejeitar visita</button>'
        : '',
      '  <button class="btn btn--outline" type="button" data-action="reschedule"><i class="bx bx-calendar-edit"></i> Propor nova data</button>',
      '  <button class="btn btn--outline" type="button" data-action="message"><i class="bx bx-message-rounded-dots"></i> Enviar mensagem</button>',
      request.status === 'confirmed'
        ? '  <button class="btn btn--navy" type="button" data-action="complete">Confirmar visita realizada</button>'
        : '',
      request.eventDetails && !request.noInterestReason
        ? '  <button class="btn btn--primary" type="button" data-action="proposal"><i class="bx bx-file"></i> Criar proposta</button>'
        : '',
      request.status !== 'pending' && request.status !== 'rejected' && request.status !== 'cancelled'
        ? '  <button class="btn btn--danger" type="button" data-action="cancel">Cancelar</button>'
        : '',
      '</div>',

      '<form class="inline-form" id="rejectForm">',
      '  <textarea id="rejectionReason" rows="3" placeholder="Indique o motivo da rejeição" required></textarea>',
      '  <button class="btn btn--danger" type="submit">Confirmar rejeição</button>',
      '</form>',

      '<form class="inline-form" id="rescheduleForm">',
      '  <input id="newDate" type="date" required aria-label="Nova data">',
      '  <input id="newTime" type="time" required aria-label="Novo horário">',
      '  <textarea id="rescheduleMessage" rows="2" placeholder="Mensagem sobre a alteração"></textarea>',
      '  <button class="btn btn--primary" type="submit">Enviar nova proposta</button>',
      '</form>',

      '<form class="inline-form" id="messageForm">',
      '  <textarea id="ownerMessage" rows="3" placeholder="Escreva uma mensagem para o cliente" required></textarea>',
      '  <button class="btn btn--primary" type="submit">Enviar mensagem</button>',
      '</form>',
      '<form class="inline-form" id="proposalForm">',
      '  <input id="proposalAmount" type="number" min="0" placeholder="Valor da proposta (MZN)" required>',
      '  <input id="proposalValidity" type="date" required>',
      '  <textarea id="proposalServices" rows="3" placeholder="Serviços incluídos e condições" required></textarea>',
      '  <textarea id="proposalTerms" rows="2" placeholder="Condições de pagamento"></textarea>',
      '  <button class="btn btn--primary" type="submit">Enviar proposta ao cliente</button>',
      '</form>'
    ].join('');

    bindActions(request);
  }

  function bindActions(request) {
    detail.querySelectorAll('[data-client-request]').forEach(function (button) {
      button.addEventListener('click', function () { selectedId = button.dataset.clientRequest; render(); });
    });
    detail.querySelectorAll('[data-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        var action = button.dataset.action;

        if (action === 'confirm') {
          request.status = 'confirmed';
          addMessage(request, 'Visita confirmada para ' + formatDate(request.date) + ' às ' + request.time + '.');
          commit('Visita confirmada e cliente notificado.');
        } else if (action === 'complete') {
          request.status = 'completed';
          request.ownerConfirmedVisitAt = new Date().toISOString();
          addMessage(request, 'O proprietário confirmou que a visita foi realizada. Já pode indicar se tem interesse no espaço.');
          commit('Visita confirmada como realizada.');
        } else if (action === 'cancel') {
          if (!window.confirm('Deseja cancelar esta visita?')) return;
          request.status = 'cancelled';
          addMessage(request, 'A visita foi cancelada pelo responsável do salão.');
          commit('Visita cancelada.');
        } else {
          var target = document.getElementById(action === 'reschedule' ? 'rescheduleForm' : action === 'reject' ? 'rejectForm' : action === 'proposal' ? 'proposalForm' : 'messageForm');
          detail.querySelectorAll('.inline-form').forEach(function (form) {
            form.classList.toggle('is-open', form === target && !target.classList.contains('is-open'));
          });
        }
      });
    });

    document.getElementById('rejectForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var reason = document.getElementById('rejectionReason').value.trim();
      if (!reason) return;
      request.status = 'rejected';
      request.rejectionReason = reason;
      addMessage(request, 'A visita foi rejeitada. Motivo: ' + reason);
      commit('Visita rejeitada e cliente notificado.');
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

    document.getElementById('proposalForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var proposal = proposals.find(function (item) { return item.visitId === request.id; });
      var data = { visitId: request.id, venueId: request.venueId, ownerId: request.ownerId, amount: document.getElementById('proposalAmount').value, validUntil: document.getElementById('proposalValidity').value, services: document.getElementById('proposalServices').value.trim(), terms: document.getElementById('proposalTerms').value.trim(), status: 'sent', sentAt: new Date().toISOString() };
      if (proposal) {
        Object.assign(proposal, data);
        delete proposal.rejectionReason;
        delete proposal.rejectedAt;
      } else proposals.push(data);
      window.localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
      request.negotiationStatus = 'proposal_sent';
      addMessage(request, 'Enviámos uma proposta no valor de MZN ' + data.amount + '. Consulte os detalhes no seu perfil.');
      commit('Proposta enviada ao cliente.');
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
