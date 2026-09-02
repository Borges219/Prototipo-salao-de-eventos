document.addEventListener('DOMContentLoaded', function () {
  var STORAGE_KEY = 'espacon_visit_requests';
  var PROPOSALS_KEY = 'espacon_owner_proposals';
  var AVAILABILITY_KEY = 'espacon_venue_blocks';
  var session = JSON.parse(localStorage.getItem('espacon_session') || 'null');
  var clients = JSON.parse(localStorage.getItem('espacon_clients') || '[]');
  if (session && session.role === 'client') {
    var sessionClient = clients.find(function (item) { return item.id === session.userId; });
    if (sessionClient) {
      session.name = sessionClient.name;
      session.email = sessionClient.email || '';
      session.phone = sessionClient.phone || '';
      localStorage.setItem('espacon_session', JSON.stringify(session));
    }
  }
  var labels = { pending: 'Aguardando resposta', confirmed: 'Confirmada', rescheduled: 'Nova data proposta', completed: 'Realizada', cancelled: 'Cancelada', rejected: 'Rejeitada' };
  var badges = { pending: 'badge--warn', confirmed: 'badge--ok', rescheduled: 'badge--info', completed: 'badge--info', cancelled: 'badge--danger', rejected: 'badge--danger' };
  var allRequests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  var requests = session && session.role === 'client' ? allRequests.filter(function (item) {
    return item.clientId ? item.clientId === session.userId : item.email.toLowerCase() === session.email.toLowerCase();
  }) : [];
  var selectedId = new URLSearchParams(location.search).get('visit') || null;
  var selectedMessageId = null;

  function esc(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function initials(name) { return name.split(' ').slice(0, 2).map(function (part) { return part[0]; }).join('').toUpperCase(); }
  function date(value) { return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value + 'T12:00:00')); }
  function badge(status) { return '<span class="badge ' + badges[status] + '">' + labels[status] + '</span>'; }
  function requestBadge(request) { return request.processStatus === 'cancelled' ? '<span class="badge badge--danger">Processo encerrado</span>' : badge(request.status); }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(allRequests)); }
  function reservationAvailability(request, eventDate) {
    if (!eventDate) return { available: true, message: '' };
    var blocks = JSON.parse(localStorage.getItem(AVAILABILITY_KEY) || '[]');
    var proposals = JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
    var latestRequests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    var manuallyBlocked = blocks.some(function (block) {
      return block.venueId === request.venueId && block.date === eventDate;
    });
    var alreadyReserved = latestRequests.some(function (other) {
      if (other.id === request.id || other.venueId !== request.venueId || !other.eventDetails || other.eventDetails.date !== eventDate) return false;
      var acceptedProposal = proposals.some(function (item) {
        return item.visitId === other.id && item.status === 'accepted';
      });
      return acceptedProposal || other.negotiationStatus === 'proposal_accepted' || other.reservationStatus === 'confirmed';
    });
    if (manuallyBlocked || alreadyReserved) {
      return { available: false, message: 'Este salão já está reservado ou bloqueado nesta data. Escolha outra data.' };
    }
    return { available: true, message: '' };
  }

  if (session && session.role === 'client') {
    document.getElementById('clientName').textContent = session.name;
    document.getElementById('clientAvatar').textContent = initials(session.name);
    document.getElementById('welcomeTitle').textContent = 'Olá, ' + session.name.split(' ')[0];
  }

  var visitRequests = requests.filter(function(r){return r.requestType !== 'reservation';});
  document.getElementById('metricAll').textContent = visitRequests.length;
  document.getElementById('metricPending').textContent = visitRequests.filter(function (r) { return r.status === 'pending'; }).length;
  document.getElementById('metricConfirmed').textContent = visitRequests.filter(function (r) { return r.status === 'confirmed'; }).length;
  document.getElementById('metricMessages').textContent = requests.reduce(function (sum, r) { return sum + (r.messages || []).length; }, 0);
  document.getElementById('clientVisitCount').textContent = visitRequests.length;

  function renderList() {
    var list = document.getElementById('clientVisitList');
    if (!visitRequests.length) { list.innerHTML = '<p class="list-empty">Ainda não tem visitas. Explore os espaços e agende a primeira.</p>'; return; }
    list.innerHTML = visitRequests.map(function (r) { return '<button class="visit-item" type="button" data-id="' + r.id + '" aria-current="' + (r.id === selectedId) + '"><span class="avatar"><i class="bx bx-building-house"></i></span><span class="visit-item__copy"><strong>' + esc(r.venue) + '</strong><span>Pedido ' + esc(r.id) + '</span><small><i class="bx bx-calendar"></i> ' + date(r.date) + ' · ' + esc(r.time) + '</small></span><span class="visit-item__side">' + requestBadge(r) + '</span></button>'; }).join('');
    list.querySelectorAll('[data-id]').forEach(function (button) { button.onclick = function () { selectedId = button.dataset.id; render(); document.getElementById('minhas-visitas').classList.add('is-detail-open'); }; });
  }

  function renderDetail() {
    var r = requests.find(function (item) { return item.id === selectedId; });
    var detail = document.getElementById('clientVisitDetail');
    if (!r) { detail.innerHTML='<div class="detail-empty"><i class="bx bx-calendar"></i><h3>Selecione uma visita</h3><p>Clique num salão para abrir a ficha completa da visita.</p></div>';return; }
    var proposals = JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
    var proposal = proposals.find(function (item) { return item.visitId === r.id; });
    detail.innerHTML = '<button class="btn btn--outline visit-detail-back" id="closeVisitDetail" type="button"><i class="bx bx-arrow-back"></i> Voltar à lista</button><div class="detail-head"><div><span class="eyebrow">' + esc(r.id) + '</span><h3>' + esc(r.venue) + '</h3><p>Solicitação enviada ao proprietário</p></div>' + requestBadge(r) + '</div>' +
      '<section class="detail-block"><h4>Dados da visita</h4><div class="detail-data"><div><small>Data</small><strong>' + date(r.date) + '</strong></div><div><small>Horário</small><strong>' + esc(r.time) + '</strong></div><div><small>Visitantes</small><strong>' + r.guests + ' pessoa(s)</strong></div><div><small>Estado</small><strong>' + labels[r.status] + '</strong></div></div>' + (r.rejectionReason ? '<p class="client-rejection"><strong>Motivo da rejeição:</strong> ' + esc(r.rejectionReason) + '</p>' : '') + '</section>' +
      (r.eventDetails ? '<section class="detail-block"><h4>Detalhes do seu evento</h4><div class="detail-data"><div><small>Tipo</small><strong>' + esc(r.eventDetails.type) + '</strong></div><div><small>Data</small><strong>' + date(r.eventDetails.date) + '</strong></div><div><small>Convidados</small><strong>' + esc(r.eventDetails.guests) + '</strong></div><div><small>Orçamento</small><strong>' + esc(r.eventDetails.budget) + '</strong></div></div><p><strong>Pacote escolhido:</strong> ' + esc(((r.eventDetails.selectedPlan || r.selectedPlan || {}).name) || 'A definir durante a negociação') + '</p>' + (r.eventDetails.notes ? '<p><strong>Observações:</strong> ' + esc(r.eventDetails.notes) + '</p>' : '') + '<p class="client-note">Negociação iniciada com o proprietário.</p></section>' : '') +
      (r.noInterestReason ? '<section class="detail-block"><h4>Processo encerrado</h4><p class="client-rejection"><strong>Sem interesse no espaço.</strong><br>Motivo informado: ' + esc(r.noInterestReason) + '</p></section>' : '') +
      (proposal ? '<p class="client-note"><i class="bx bx-message-rounded-dots"></i> A proposta e a negociação deste evento estão disponíveis na secção Mensagens.</p>' : '') +
      '<form class="inline-form" id="interestForm"><input id="interestType" placeholder="Tipo de evento" required><input id="interestDate" type="date" required><p class="availability-error" id="eventAvailabilityError" role="alert" hidden></p><input id="interestGuests" type="number" min="1" placeholder="Número de convidados" required><input id="interestBudget" placeholder="Orçamento previsto (MZN)" required><textarea id="interestNotes" rows="3" placeholder="Observações adicionais ou necessidades específicas (opcional)"></textarea><p class="availability-note">Os serviços incluídos serão os definidos no pacote escolhido. A disponibilidade é atualizada pela agenda do proprietário.</p><button class="btn btn--primary" type="submit">Enviar detalhes e iniciar negociação</button></form>' +
      '<form class="inline-form" id="noInterestForm"><textarea id="noInterestReason" rows="3" placeholder="Explique brevemente por que o espaço não corresponde ao que procura" required></textarea><button class="btn btn--danger" type="submit">Confirmar e encerrar processo</button></form>' +
      '<div class="detail-actions"><a class="btn btn--outline" href="detalhes-salao.html?id=' + encodeURIComponent(r.venueId) + '&source=profile"><i class="bx bx-show"></i> Ver salão</a>' + (r.status === 'pending' ? '<button class="btn btn--danger" id="cancelVisit" type="button">Cancelar pedido</button>' : '') + (r.status === 'confirmed' ? '<button class="btn btn--navy" id="clientCompleteVisit" type="button"><i class="bx bx-check-circle"></i> Confirmar visita realizada</button>' : '') + (r.status === 'completed' && !r.eventDetails && !r.noInterestReason ? '<button class="btn btn--primary" id="showInterest" type="button"><i class="bx bx-heart"></i> Tenho interesse</button><button class="btn btn--danger" id="showNoInterest" type="button"><i class="bx bx-x"></i> Não tenho interesse</button>' : '') + '</div>';
    document.getElementById('closeVisitDetail').onclick=function(){selectedId=null;document.getElementById('minhas-visitas').classList.remove('is-detail-open');render();};
    var cancel = document.getElementById('cancelVisit'); if (cancel) cancel.onclick = function () { if (!confirm('Deseja cancelar este pedido de visita?')) return; r.status = 'cancelled'; save(); render(); window.EspacoOn.toast('Pedido de visita cancelado.'); };
    var complete = document.getElementById('clientCompleteVisit'); if (complete) complete.onclick = function () { r.status = 'completed'; r.clientConfirmedVisitAt = new Date().toISOString(); r.messages = r.messages || []; r.messages.push({ author:'client', text:'Confirmo que a visita foi realizada.', at:new Date().toISOString() }); save(); render(); window.EspacoOn.toast('Visita confirmada como realizada.'); };
    var interest = document.getElementById('showInterest'); if (interest) interest.onclick = function () { document.getElementById('interestForm').classList.add('is-open'); document.getElementById('interestType').focus(); };
    var noInterest = document.getElementById('showNoInterest'); if (noInterest) noInterest.onclick = function () { document.getElementById('noInterestForm').classList.add('is-open'); document.getElementById('noInterestReason').focus(); };
    var interestDate = document.getElementById('interestDate');
    var availabilityError = document.getElementById('eventAvailabilityError');
    interestDate.min = new Date().toISOString().slice(0, 10);
    function validateReservationDate() {
      var result = reservationAvailability(r, interestDate.value);
      interestDate.setCustomValidity(result.message);
      availabilityError.textContent = result.message;
      availabilityError.hidden = result.available;
      return result.available;
    }
    interestDate.addEventListener('change', validateReservationDate);
    document.getElementById('interestForm').onsubmit = function (event) { event.preventDefault(); if (!validateReservationDate()) { interestDate.reportValidity(); return; } r.eventDetails = { type:document.getElementById('interestType').value.trim(), date:interestDate.value, guests:document.getElementById('interestGuests').value, budget:document.getElementById('interestBudget').value.trim(), services:[], selectedPlan:r.selectedPlan||null, notes:document.getElementById('interestNotes').value.trim(), sentAt:new Date().toISOString() }; r.negotiationStatus='interested'; r.messages=r.messages||[]; r.messages.push({author:'client',text:'Tenho interesse no espaço e enviei os detalhes do meu evento para iniciar a negociação.',at:new Date().toISOString()}); save(); render(); window.EspacoOn.toast('Interesse enviado. A negociação foi iniciada.'); };
    document.getElementById('noInterestForm').onsubmit = function (event) { event.preventDefault(); var reason=document.getElementById('noInterestReason').value.trim(); if(!reason)return; r.noInterestReason=reason; r.noInterestAt=new Date().toISOString(); r.negotiationStatus='cancelled_no_interest'; r.processStatus='cancelled'; r.messages=r.messages||[]; r.messages.push({author:'client',text:'Não tenho interesse em avançar com este espaço. Motivo: '+reason,at:new Date().toISOString()}); save(); render(); window.EspacoOn.toast('Processo encerrado. O proprietário foi informado.'); };
  }

  function render() { renderList(); renderDetail(); renderMessages(); renderReservations(); renderPayments(); }

  function openView(name) {
    document.querySelectorAll('.client-view').forEach(function (view) { view.hidden = view.dataset.view !== name; });
    document.querySelectorAll('[data-client-view]').forEach(function (link) {
      if (link.dataset.clientView === name) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    location.hash = name === 'overview' ? 'visao-geral' : name;
    document.getElementById('sidebar').classList.remove('is-open');
    document.getElementById('backdrop').classList.remove('is-visible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openAgendaSection(name) {
    document.querySelectorAll('[data-agenda-panel]').forEach(function (panel) { panel.hidden = panel.dataset.agendaPanel !== name; });
    document.querySelectorAll('[data-agenda-section]').forEach(function (button) { button.classList.toggle('is-active', button.dataset.agendaSection === name); });
  }

  document.querySelectorAll('[data-client-view]').forEach(function (link) { link.addEventListener('click', function (event) { event.preventDefault(); openView(link.dataset.clientView); }); });
  document.querySelectorAll('[data-open-view]').forEach(function (button) { button.addEventListener('click', function () { openView(button.dataset.openView); }); });
  document.querySelectorAll('[data-agenda-section]').forEach(function (button) { button.addEventListener('click', function () { openAgendaSection(button.dataset.agendaSection); }); });

  function renderMessages() {
    var container = document.getElementById('clientMessages');
    var conversations = requests.filter(function (r) { return (r.messages || []).length; });
    if (!conversations.length) { container.innerHTML = '<div class="card client-empty"><i class="bx bx-message-rounded-dots"></i><h3>Ainda não há mensagens</h3><p>As conversas com os proprietários aparecerão aqui.</p></div>'; return; }
    var active = conversations.find(function(r){return r.id===selectedMessageId;});
    if(active){
      var proposals=JSON.parse(localStorage.getItem(PROPOSALS_KEY)||'[]');var proposal=proposals.find(function(p){return p.visitId===active.id;});var history=(active.messages||[]).map(function(m){return '<p class="message '+(m.author==='client'?'message--mine':'')+'"><strong>'+(m.author==='client'?'Você':'Proprietário')+':</strong> '+esc(m.text)+'</p>';}).join('');
      container.innerHTML='<section class="card message-detail"><div class="message-detail__head"><div><span class="eyebrow">Negociação '+esc(active.id)+'</span><h3>'+esc(active.venue)+'</h3><p>Conversa exclusiva com o proprietário deste salão.</p></div><button class="btn btn--outline" id="backToMessages" type="button"><i class="bx bx-arrow-back"></i> Voltar</button></div><div class="message-log">'+history+'</div><form class="inline-form is-open" id="messageViewForm"><textarea id="messageViewInput" rows="3" placeholder="Escreva uma mensagem ao proprietário" required></textarea><button class="btn btn--primary" type="submit"><i class="bx bx-send"></i> Enviar mensagem</button></form>'+(proposal?'<section class="detail-block client-proposal"><h4>Proposta recebida</h4><div class="detail-data"><div><small>Valor total</small><strong>MZN '+esc(proposal.amount)+'</strong></div><div><small>Pagamento</small><strong>100% · pagamento único</strong></div><div><small>Estado</small><strong>'+(proposal.status==='accepted'?'Aceite':proposal.status==='rejected'?'Rejeitada':'Aguardando decisão')+'</strong></div></div><p><strong>Serviços:</strong> '+esc(proposal.services||((active.eventDetails&&active.eventDetails.services||[]).join(', '))||'A definir')+'</p>'+(proposal.status==='pending'?'<div class="detail-actions"><button class="btn btn--primary" id="messageAcceptProposal" type="button">Aceitar proposta</button><button class="btn btn--danger" id="messageRejectProposal" type="button">Rejeitar proposta</button></div>':'')+'</section>':'')+'</section>';
      document.getElementById('backToMessages').onclick=function(){selectedMessageId=null;renderMessages();};
      document.getElementById('messageViewForm').onsubmit=function(event){event.preventDefault();var input=document.getElementById('messageViewInput');active.messages=active.messages||[];active.messages.push({author:'client',text:input.value.trim(),at:new Date().toISOString()});save();renderMessages();window.EspacoOn.toast('Mensagem enviada ao proprietário.');};
      var accept=document.getElementById('messageAcceptProposal');if(accept)accept.onclick=function(){if(!confirm('Aceitar a proposta de MZN '+proposal.amount+'? O pagamento será feito na secção Pagamentos.'))return;proposal.status='accepted';proposal.paymentStatus='pending';proposal.acceptedAt=new Date().toISOString();localStorage.setItem(PROPOSALS_KEY,JSON.stringify(proposals));active.negotiationStatus='awaiting_payment';active.reservationStatus='awaiting_payment';active.messages.push({author:'client',text:'Aceitei a proposta. A reserva aguarda o pagamento integral.',at:new Date().toISOString()});save();selectedMessageId=null;render();openView('agenda');openAgendaSection('reservations');window.EspacoOn.toast('Proposta aceite. A reserva foi criada e aguarda pagamento.');};
      var reject=document.getElementById('messageRejectProposal');if(reject)reject.onclick=function(){var reason=prompt('Indique o motivo da rejeição da proposta:');if(!reason)return;proposal.status='rejected';proposal.rejectionReason=reason;proposal.rejectedAt=new Date().toISOString();localStorage.setItem(PROPOSALS_KEY,JSON.stringify(proposals));active.negotiationStatus='proposal_rejected';active.messages.push({author:'client',text:'Rejeitei a proposta. Motivo: '+reason,at:new Date().toISOString()});save();renderMessages();window.EspacoOn.toast('Proposta rejeitada.');};
      return;
    }
    container.innerHTML = conversations.map(function (r) {
      var last = r.messages[r.messages.length - 1];
      return '<button class="card client-row" type="button" data-conversation="' + esc(r.id) + '"><i class="bx bx-message-rounded-dots"></i><span><strong>' + esc(r.venue) + '</strong><small>' + esc(last.author === 'client' ? 'Você: ' + last.text : 'Proprietário: ' + last.text) + '</small></span><i class="bx bx-chevron-right"></i></button>';
    }).join('');
    container.querySelectorAll('[data-conversation]').forEach(function (button) { button.onclick = function () { selectedMessageId=button.dataset.conversation;renderMessages(); }; });
  }

  function renderReservations() {
    var container = document.getElementById('clientReservations');
    var currentProposals = JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]');
    var reservations = requests.filter(function (r) { return !r.noInterestReason && (r.requestType==='reservation'||currentProposals.some(function(p){return p.visitId===r.id&&p.status==='accepted';})); });
    document.getElementById('agendaReservationCount').textContent = reservations.length;
    document.getElementById('agendaVisitCount').textContent = visitRequests.length;
    if (!reservations.length) { container.innerHTML = '<div class="card client-empty"><i class="bx bx-bookmark"></i><h3>Ainda não há reservas</h3><p>Depois de demonstrar interesse num salão, o processo da sua reserva aparecerá aqui.</p></div>'; return; }
    container.innerHTML = reservations.map(function (r) { var proposal=currentProposals.find(function(item){return item.visitId===r.id;});var paid=proposal&&proposal.paymentStatus==='paid';var state=paid?'Confirmada e paga':proposal&&proposal.status==='accepted'?'Aguardando pagamento':'Aguardando resposta';var stateClass=paid?'badge--ok':'badge--warn';return '<article class="card client-row"><i class="bx bx-building-house"></i><span><strong>' + esc(r.venue) + '</strong><small>Evento em ' + date(r.eventDetails.date) + ' · ' + esc(r.eventDetails.guests) + ' convidado(s)</small></span><span class="badge '+stateClass+'">'+state+'</span></article>'; }).join('');
  }

  function renderPayments(){var container=document.getElementById('clientPayments');var proposals=JSON.parse(localStorage.getItem(PROPOSALS_KEY)||'[]');var payable=requests.map(function(r){return {request:r,proposal:proposals.find(function(p){return p.visitId===r.id&&p.status==='accepted';})};}).filter(function(item){return Boolean(item.proposal);});document.getElementById('agendaPaymentCount').textContent=payable.filter(function(item){return item.proposal.paymentStatus!=='paid';}).length;if(!payable.length){container.innerHTML='<div class="card client-empty"><i class="bx bx-wallet"></i><h3>Sem pagamentos</h3><p>Depois de aceitar uma proposta, o pagamento aparecerá aqui.</p></div>';return;}container.innerHTML=payable.map(function(item){var paid=item.proposal.paymentStatus==='paid';return '<article class="card client-row"><i class="bx bx-wallet"></i><span><strong>'+esc(item.request.venue)+'</strong><small>Pagamento único de 100% · MZN '+esc(item.proposal.amount)+'</small></span><div class="payment-row__actions"><span class="badge '+(paid?'badge--ok':'badge--warn')+'">'+(paid?'Pago':'Pendente')+'</span>'+(paid?'':'<button class="btn btn--primary" type="button" data-pay="'+esc(item.request.id)+'">Pagar agora</button>')+'</div></article>';}).join('');container.querySelectorAll('[data-pay]').forEach(function(button){button.onclick=function(){var item=payable.find(function(entry){return entry.request.id===button.dataset.pay;});if(!confirm('Confirmar pagamento único de MZN '+item.proposal.amount+'? Este pagamento é fictício para demonstração.'))return;item.proposal.paymentStatus='paid';item.proposal.paidAmount=item.proposal.amount;item.proposal.paidAt=new Date().toISOString();item.request.paymentStatus='paid';item.request.reservationStatus='confirmed';item.request.negotiationStatus='completed';item.request.messages=item.request.messages||[];item.request.messages.push({author:'client',text:'Pagamento integral de MZN '+item.proposal.amount+' efetuado. Reserva confirmada.',at:new Date().toISOString()});localStorage.setItem(PROPOSALS_KEY,JSON.stringify(proposals));save();render();openView('agenda');openAgendaSection('payments');window.EspacoOn.toast('Pagamento confirmado. A reserva está ativa.');};});}

  var venueCatalog = [
    ['acacia','Salão Acácia','social','Sommerschield, Maputo','Até 350 pessoas','Desde 185.000 MZN','salao-acacia-destaque-web.jpg','Salão elegante para casamentos e receções.'],
    ['baia','Baía Lounge','social','Costa do Sol, Maputo','Até 500 pessoas','Desde 280.000 MZN','baia-salao-praia-ai.jpg','Salão contemporâneo com vista para o Oceano Índico.'],
    ['safira','Salão Safira','social','Polana, Maputo','Até 220 pessoas','Desde 140.000 MZN','safira-destaque-ai.jpg','Ambiente moderno para celebrações e receções.'],
    ['perola','Espaço Pérola','social','Triunfo, Maputo','Até 160 pessoas','Desde 110.000 MZN','perola-destaque-ai.jpg','Espaço acolhedor com lounge e área exterior.'],
    ['quinta','Quinta das Palmeiras','social','Marracuene','Até 400 pessoas','Desde 175.000 MZN','quinta-destaque-ai.jpg','Quinta arborizada para eventos ao ar livre.'],
    ['terraco','Terraço Índico','social','Marginal, Maputo','Até 140 pessoas','Desde 125.000 MZN','terraco-destaque-ai.jpg','Terraço para receções, cocktails e jantares.'],
    ['villa','Villa Mahotas','social','Mahotas, Maputo','Até 300 pessoas','Desde 155.000 MZN','villa-destaque-ai.jpg','Villa com salão interior e jardim reservado.'],
    ['moringa','Salão Moringa','social','Sommerschield II, Maputo','Até 260 pessoas','Desde 150.000 MZN','moringa-destaque-ai.jpg','Salão contemporâneo de configuração flexível.'],
    ['zambeze','Jardim Zambeze','social','Albasine, Maputo','Até 340 pessoas','Desde 135.000 MZN','zambeze-destaque-ai.jpg','Jardim amplo com área coberta.'],
    ['ndlovu','Jardim Ndlovu','corporativo','Matola Rio, Matola','Até 180 participantes','Desde 95.000 MZN','ndlovu-conferencia-vazia-ai.jpg','Espaço equipado para conferências e formações.'],
    ['auditorio-maputo','Auditório Maputo','corporativo','Baixa, Maputo','Até 500 participantes','Desde 210.000 MZN','auditorio-maputo-destaque-ai.jpg','Auditório com palco, projeção e apoio técnico.'],
    ['sala-indico','Sala Índico','corporativo','Polana, Maputo','Até 80 participantes','Desde 65.000 MZN','sala-indico-destaque-ai.jpg','Sala executiva para reuniões e apresentações.'],
    ['centro-matola','Centro Matola','corporativo','Matola, Maputo','Até 300 participantes','Desde 145.000 MZN','centro-matola-destaque-ai.jpg','Centro modular para congressos e formações.'],
    ['hub-baixa','Hub Baixa','corporativo','Baixa, Maputo','Até 120 participantes','Desde 85.000 MZN','hub-baixa-destaque-ai.jpg','Hub urbano para workshops e networking.'],
    ['centro-polana','Centro Polana','corporativo','Polana Cimento, Maputo','Até 200 participantes','Desde 120.000 MZN','centro-polana-destaque-ai.jpg','Centro de formação com recursos audiovisuais.'],
    ['pavilhao-katembe','Pavilhão KaTembe','corporativo','KaTembe, Maputo','Até 600 participantes','Desde 240.000 MZN','pavilhao-katembe-destaque-ai.jpg','Pavilhão para feiras, exposições e lançamentos.'],
    ['business-sommerschield','Business Center Sommerschield','corporativo','Sommerschield, Maputo','Até 150 participantes','Desde 105.000 MZN','business-sommerschield-destaque-ai.jpg','Centro empresarial moderno e equipado.'],
    ['centro-kampfumo','Centro de Conferências KaMpfumo','corporativo','KaMpfumo, Maputo','Até 420 participantes','Desde 195.000 MZN','centro-kampfumo-destaque-ai.jpg','Centro para congressos e grandes encontros profissionais.']
  ].map(function (v) { return { id:v[0], name:v[1], type:v[2], city:v[3], capacity:v[4], price:v[5], photo:v[6], description:v[7] }; });

  var citySelect = document.getElementById('dashVenueCity');
  Array.from(new Set(venueCatalog.map(function (v) { return v.city; }))).sort().forEach(function (city) { citySelect.insertAdjacentHTML('beforeend', '<option value="' + city + '">' + city + '</option>'); });
  function normal(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function renderVenues() {
    var term = normal(document.getElementById('dashVenueSearch').value);
    var type = document.getElementById('dashVenueType').value;
    var city = citySelect.value;
    var items = venueCatalog.filter(function (v) { return (!term || normal(v.name + ' ' + v.city).includes(term)) && (!type || v.type === type) && (!city || v.city === city); });
    document.getElementById('dashResultsCount').textContent = items.length + ' espaços encontrados';
    document.getElementById('dashVenueGrid').innerHTML = items.map(function (v) { return '<article class="card client-venue"><img src="../assets/images/' + v.photo + '" alt="' + esc(v.name) + '"><div><small>' + (v.type === 'social' ? 'Evento social' : 'Evento corporativo') + '</small><h3>' + esc(v.name) + '</h3><p><i class="bx bx-map"></i> ' + esc(v.city) + '</p><div class="client-venue__facts"><span>' + esc(v.capacity) + '</span><strong>' + esc(v.price) + '</strong></div><button class="btn btn--outline" type="button" data-venue-detail="' + v.id + '">Ver detalhes</button></div></article>'; }).join('');
    document.querySelectorAll('[data-venue-detail]').forEach(function (button) { button.onclick = function () { showVenue(button.dataset.venueDetail); }; });
  }

  function favoriteIds() {
    var all = JSON.parse(localStorage.getItem('espacon_favorites') || '{}');
    return session && session.role === 'client' ? (all[session.userId] || []) : [];
  }

  function renderFavorites() {
    var ids = favoriteIds();
    var items = ids.map(function (id) { return venueCatalog.find(function (venue) { return venue.id === id; }); }).filter(Boolean);
    document.getElementById('clientFavoriteCount').textContent = items.length;
    var grid = document.getElementById('clientFavoriteGrid');
    if (!items.length) {
      grid.innerHTML = '<div class="card client-empty client-favorites-empty"><i class="bx bx-heart"></i><h3>Ainda não guardou nenhum salão</h3><p>Clique no coração de um espaço para encontrá-lo novamente aqui.</p><button class="btn btn--primary" type="button" data-empty-explore>Explorar espaços</button></div>';
      grid.querySelector('[data-empty-explore]').onclick = function () { openView('explore'); };
      return;
    }
    grid.innerHTML = items.map(function (v) { return '<article class="card client-venue client-favorite-card"><div class="client-favorite-card__photo"><img src="../assets/images/' + v.photo + '" alt="' + esc(v.name) + '"><button type="button" data-remove-favorite="' + v.id + '" aria-label="Remover ' + esc(v.name) + ' dos favoritos"><i class="bx bxs-heart"></i></button></div><div><small>' + (v.type === 'social' ? 'Evento social' : 'Evento corporativo') + '</small><h3>' + esc(v.name) + '</h3><p><i class="bx bx-map"></i> ' + esc(v.city) + '</p><div class="client-venue__facts"><span>' + esc(v.capacity) + '</span><strong>' + esc(v.price) + '</strong></div><button class="btn btn--outline" type="button" data-favorite-detail="' + v.id + '">Ver detalhes</button></div></article>'; }).join('');
    grid.querySelectorAll('[data-remove-favorite]').forEach(function (button) { button.onclick = function () { var all = JSON.parse(localStorage.getItem('espacon_favorites') || '{}'); all[session.userId] = (all[session.userId] || []).filter(function (id) { return id !== button.dataset.removeFavorite; }); localStorage.setItem('espacon_favorites', JSON.stringify(all)); renderFavorites(); window.EspacoOn.toast('Salão removido dos favoritos.'); }; });
    grid.querySelectorAll('[data-favorite-detail]').forEach(function (button) { button.onclick = function () { showVenue(button.dataset.favoriteDetail); }; });
  }
  function showVenue(id) {
    var v = venueCatalog.find(function (item) { return item.id === id; });
    var detail = document.getElementById('dashVenueDetail');
    detail.innerHTML = '<button class="client-venue-detail__close" type="button" aria-label="Fechar detalhes"><i class="bx bx-x"></i></button><img src="../assets/images/' + v.photo + '" alt="' + esc(v.name) + '"><div><span class="eyebrow">' + (v.type === 'social' ? 'Evento social' : 'Evento corporativo') + '</span><h2>' + esc(v.name) + '</h2><p><i class="bx bx-map"></i> ' + esc(v.city) + '</p><p>' + esc(v.description) + '</p><div class="client-venue-detail__facts"><span><small>Capacidade</small><strong>' + esc(v.capacity) + '</strong></span><span><small>Preço inicial</small><strong>' + esc(v.price) + '</strong></span></div><a class="btn btn--primary" href="detalhes-salao.html?id=' + v.id + '&source=profile"><i class="bx bx-calendar"></i> Agendar visita</a></div>';
    detail.hidden = false;
    detail.querySelector('button').onclick = function () { detail.hidden = true; };
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.getElementById('dashApplyFilters').onclick = renderVenues;

  var client = session && clients.find(function (item) { return item.id === session.userId; });
  if (!client && session) client = { id: session.userId, name: session.name || '', email: session.email || '', phone: '' };
  if (client) { document.getElementById('profileName').value = client.name || ''; document.getElementById('profilePhone').value = client.phone || ''; document.getElementById('profileEmail').value = client.email || ''; }
  document.getElementById('personalDataForm').onsubmit = function (event) {
    event.preventDefault();
    var nextEmail = event.target.elements.email.value.trim().toLowerCase();
    var nextPhone = event.target.elements.phone.value.trim();
    var normalizedPhone = nextPhone.replace(/\D/g, '');
    if (!nextEmail && !normalizedPhone) { window.EspacoOn.toast('Informe pelo menos um e-mail ou telefone.'); return; }
    var owners = JSON.parse(localStorage.getItem('espacon_owners') || '[]');
    var duplicateClient = clients.find(function (item) { return item.id !== client.id && ((nextEmail && String(item.email || '').toLowerCase() === nextEmail) || (normalizedPhone && String(item.phone || '').replace(/\D/g, '') === normalizedPhone)); });
    var duplicateOwner = owners.find(function (item) { return (nextEmail && String(item.email || '').toLowerCase() === nextEmail) || (normalizedPhone && String(item.phone || '').replace(/\D/g, '') === normalizedPhone); });
    if (nextEmail === 'admin@espacoon.co.mz' || nextEmail === 'proprietario@espacoon.co.mz' || duplicateClient || duplicateOwner) {
      window.EspacoOn.toast('O e-mail ou telefone já está associado a outro perfil.');
      return;
    }
    client.name = event.target.elements.name.value.trim(); client.phone = nextPhone; client.email = nextEmail;
    var index = clients.findIndex(function (item) { return item.id === client.id; }); if (index < 0) clients.push(client); else clients[index] = client;
    session.name = client.name; session.email = client.email; localStorage.setItem('espacon_clients', JSON.stringify(clients)); localStorage.setItem('espacon_session', JSON.stringify(session));
    document.getElementById('clientName').textContent = client.name; document.getElementById('clientAvatar').textContent = initials(client.name); document.getElementById('welcomeTitle').textContent = 'Olá, ' + client.name.split(' ')[0];
    window.EspacoOn.toast('Dados pessoais atualizados.');
  };
  document.getElementById('passwordForm').onsubmit = function (event) {
    event.preventDefault(); var password = event.target.elements.password.value; var confirmation = event.target.elements.confirmation.value;
    if (password !== confirmation) { window.EspacoOn.toast('As palavras-passe não coincidem.'); return; }
    client.password = password; var index = clients.findIndex(function (item) { return item.id === client.id; }); if (index < 0) clients.push(client); else clients[index] = client; localStorage.setItem('espacon_clients', JSON.stringify(clients)); event.target.reset(); window.EspacoOn.toast('Palavra-passe atualizada.');
  };

  render(); renderVenues(); renderFavorites();
  var hashViews = { '#agenda':'agenda', '#visits':'agenda', '#minhas-visitas':'agenda', '#messages':'messages', '#mensagens':'messages', '#reservations':'agenda', '#minhas-reservas':'agenda', '#favorites':'favorites', '#favoritos':'favorites', '#explore':'explore', '#explorar-espacos':'explore', '#profile':'profile', '#dados-pessoais':'profile' };
  openView(hashViews[location.hash] || 'overview');
});
