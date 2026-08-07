/* Painel e gráficos de desempenho do proprietário. */

document.addEventListener('DOMContentLoaded', function () {
  var session = JSON.parse(localStorage.getItem('espacon_session') || 'null');
  var ownerName = session && session.role === 'owner' ? session.name : 'Manuel António';
  var initials = ownerName.split(' ').slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
  var hour = new Date().getHours();
  var greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('ownerName').textContent = ownerName;
  document.getElementById('ownerAvatar').textContent = initials;
  document.getElementById('ownerGreeting').textContent = greeting + ', ' + ownerName.split(' ')[0] + '.';
  document.getElementById('ownerDate').textContent = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
  var requests = JSON.parse(localStorage.getItem('espacon_visit_requests') || '[]');
  requests = requests.filter(function (item) { return !item.ownerId || !session || item.ownerId === session.userId; });
  var proposals = [];
  var AVAILABILITY_KEY = 'espacon_venue_blocks';
  document.getElementById('ownerPendingCount').textContent = requests.filter(function (item) { return item.status === 'pending'; }).length;

  var statusNames = { pending: 'Aguardando resposta', confirmed: 'Confirmada', rescheduled: 'Nova data proposta', completed: 'Realizada', cancelled: 'Cancelada', rejected: 'Rejeitada' };
  var statusClasses = { pending: 'badge--warn', confirmed: 'badge--ok', rescheduled: 'badge--info', completed: 'badge--info', cancelled: 'badge--danger', rejected: 'badge--danger' };
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]; }); }
  function formatDate(value) { return new Intl.DateTimeFormat('pt-PT', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(value + 'T12:00:00')); }
  function badge(status) { return '<span class="badge ' + statusClasses[status] + '">' + statusNames[status] + '</span>'; }
  function empty(icon, title, copy) { return '<div class="card owner-empty"><i class="bx ' + icon + '"></i><h3>' + title + '</h3><p>' + copy + '</p></div>'; }
  function requestCard(item, action) { return '<article class="card owner-record"><div class="owner-record__icon"><i class="bx bx-calendar-check"></i></div><div><strong>' + esc(item.client) + '</strong><p>' + esc(item.venue) + ' · ' + formatDate(item.date) + ' às ' + esc(item.time) + '</p></div>' + badge(item.status) + '<a class="btn btn--outline" href="dashboard-proprietario-visitas.html?view=detail&visit=' + encodeURIComponent(item.id) + '">' + action + '</a></article>'; }
  function reservationBadge(item) { var proposal=proposals.find(function(p){return p.visitId===item.id;});var started=Boolean(item.eventDetails)||Boolean(proposal)||Boolean(item.reservationStatus)||Boolean(item.paymentStatus)||['interested','proposal_sent','proposal_rejected','awaiting_payment','completed'].includes(item.negotiationStatus);if(!started)return '<span class="badge badge--info">Ainda não iniciada</span>';var cancelled=item.processStatus==='cancelled'||Boolean(item.noInterestReason);if(cancelled)return '<span class="badge badge--danger">Cancelada</span>';if(item.reservationStatus==='confirmed'||item.paymentStatus==='paid'||(proposal&&proposal.paymentStatus==='paid'))return '<span class="badge badge--ok">Confirmada</span>';if((proposal&&proposal.status==='accepted')||item.reservationStatus==='awaiting_payment')return '<span class="badge badge--warn">Aguardando pagamento</span>';return '<span class="badge badge--warn">Em negociação</span>'; }
  function reservationState(item) { var proposal=proposals.find(function(p){return p.visitId===item.id;});if(item.processStatus==='cancelled'||item.noInterestReason)return 'cancelled';if(item.reservationStatus==='confirmed'||item.paymentStatus==='paid'||(proposal&&proposal.paymentStatus==='paid'))return 'confirmed';return 'pending'; }
  function reservationTable(items) { return '<div class="card owner-data-table"><div class="owner-data-table__head"><span>Código</span><span>Nome do cliente</span><span>Salão</span><span>Estado da visita</span><span>Estado da reserva</span><span>Acções</span></div>' + items.map(function(item){var eventDate=item.eventDetails&&item.eventDetails.date?item.eventDetails.date:item.date;return '<article class="owner-data-table__row"><code>'+esc(item.id)+'</code><div><strong>'+esc(item.client)+'</strong><small>Evento: '+formatDate(eventDate)+'</small></div><span>'+esc(item.venue)+'</span>'+badge(item.status)+reservationBadge(item)+'<button class="btn btn--outline" type="button" data-reservation="'+esc(item.id)+'">Ver reserva</button></article>';}).join('') + '</div><section class="card reservation-detail" id="ownerReservationDetail" hidden></section>'; }
  function showReservation(item){if(!item)return;var proposal=proposals.find(function(p){return p.visitId===item.id;});var eventDate=item.eventDetails&&item.eventDetails.date?item.eventDetails.date:item.date;var panel=document.getElementById('ownerReservationDetail');panel.hidden=false;panel.innerHTML='<button class="reservation-detail__close" type="button" aria-label="Fechar"><i class="bx bx-x"></i></button><span class="eyebrow">Reserva '+esc(item.id)+'</span><div class="reservation-detail__head"><div><h3>'+esc(item.client)+'</h3><p>'+esc(item.venue)+'</p></div><div class="reservation-detail__statuses">'+badge(item.status)+reservationBadge(item)+'</div></div><div class="detail-data"><div><small>Data do evento</small><strong>'+formatDate(eventDate)+'</strong></div><div><small>Convidados</small><strong>'+esc(item.eventDetails?item.eventDetails.guests:item.guests)+' pessoa(s)</strong></div><div><small>Pagamento</small><strong>'+(proposal&&proposal.paymentStatus==='paid'?'Pago integralmente':'Pendente')+'</strong></div><div><small>Valor</small><strong>'+(proposal?'MZN '+esc(proposal.amount):'Por definir')+'</strong></div></div>';panel.querySelector('.reservation-detail__close').onclick=function(){panel.hidden=true;};panel.scrollIntoView({behavior:'smooth',block:'start'});}

  function renderOwnerSections() {
    var requestIds = requests.map(function (request) { return request.id; });
    proposals = JSON.parse(localStorage.getItem('espacon_owner_proposals') || '[]').filter(function (proposal) { return requestIds.includes(proposal.visitId); });
    var reservations=requests.filter(function(item){return Boolean(item.eventDetails)||Boolean(proposals.find(function(p){return p.visitId===item.id;}))||Boolean(item.reservationStatus)||['interested','proposal_sent','proposal_rejected','awaiting_payment','completed'].includes(item.negotiationStatus);});
    document.getElementById('reservationPendingMetric').textContent=reservations.filter(function(item){return reservationState(item)==='pending';}).length;
    document.getElementById('reservationConfirmedMetric').textContent=reservations.filter(function(item){return reservationState(item)==='confirmed';}).length;
    document.getElementById('reservationCancelledMetric').textContent=reservations.filter(function(item){return reservationState(item)==='cancelled';}).length;
    document.getElementById('ownerReservations').innerHTML=reservations.length?reservationTable(reservations):empty('bx-bookmark','Sem reservas','As reservas aparecerão quando um cliente iniciar a negociação.');
    document.querySelectorAll('[data-reservation]').forEach(function(button){button.onclick=function(){showReservation(reservations.find(function(item){return item.id===button.dataset.reservation;}));};});
    var adminVenues = JSON.parse(localStorage.getItem('espacon_admin_venues') || '[]');
    var myVenues = adminVenues.filter(function (venue) { return !session || venue.ownerId === session.userId; });
    if (!myVenues.length && (!session || session.userId === 'owner-acacia')) myVenues = [{ id:'acacia', name:'Salão Acácia', location:'Sommerschield, Maputo', capacity:350, status:'published', ownerId:'owner-acacia' }];
    var agenda = requests.filter(function (r) { return ['confirmed','rescheduled','pending'].includes(r.status); }).sort(function (a,b) { return a.date.localeCompare(b.date); });
    document.getElementById('ownerAgenda').innerHTML = agenda.length ? agenda.map(function (r) { var proposal=proposals.find(function(p){return p.visitId===r.id;});var kind=proposal&&proposal.status==='accepted'?'Reserva':'Visita';return '<article class="card owner-record"><div class="owner-record__icon"><i class="bx bx-calendar-check"></i></div><div><strong>'+esc(r.client)+' · '+esc(kind)+'</strong><p>'+esc(r.venue)+' · '+formatDate(r.date)+' às '+esc(r.time)+'</p></div>'+badge(r.status)+'<a class="btn btn--outline" href="dashboard-proprietario-visitas.html?view=detail&visit='+encodeURIComponent(r.id)+'">Abrir</a></article>'; }).join('') : empty('bx-calendar', 'Agenda vazia', 'Ainda não existem visitas ou eventos agendados.');
    document.getElementById('agendaBlockVenue').innerHTML = myVenues.map(function(v){return '<option value="'+esc(v.id)+'">'+esc(v.name)+'</option>';}).join('');
    var blocks=JSON.parse(localStorage.getItem(AVAILABILITY_KEY)||'[]').filter(function(block){return !session||block.ownerId===session.userId;}).sort(function(a,b){return a.date.localeCompare(b.date);});
    document.getElementById('ownerAgendaBlocks').innerHTML=blocks.length?blocks.map(function(block){var venue=myVenues.find(function(v){return v.id===block.venueId;});return '<article class="card owner-record"><div class="owner-record__icon"><i class="bx bx-lock"></i></div><div><strong>'+esc(venue?venue.name:'Salão')+'</strong><p>'+formatDate(block.date)+(block.time?' às '+esc(block.time):' · Dia inteiro')+' · '+esc(block.reason)+'</p></div><span class="badge badge--danger">Bloqueada</span><button class="btn btn--outline" type="button" data-unblock="'+esc(block.id)+'">Desbloquear</button></article>';}).join(''):empty('bx-lock-open','Sem bloqueios','Não existem datas bloqueadas manualmente.');
    document.querySelectorAll('[data-unblock]').forEach(function(button){button.onclick=function(){var all=JSON.parse(localStorage.getItem(AVAILABILITY_KEY)||'[]').filter(function(block){return block.id!==button.dataset.unblock;});localStorage.setItem(AVAILABILITY_KEY,JSON.stringify(all));renderOwnerSections();window.EspacoOn.toast('Data desbloqueada para os clientes.');};});

    document.getElementById('ownerVenues').innerHTML = myVenues.length ? myVenues.map(function (venue) { var cover = venue.photos && venue.photos[0] ? venue.photos[0] : '../assets/images/salao-acacia-destaque-web.jpg'; return '<article class="card owner-venue-card"><img src="' + cover + '" alt="' + esc(venue.name) + '"><div><span class="badge ' + (venue.status === 'published' ? 'badge--ok">Publicado' : 'badge--warn">Indisponível') + '</span><h3>' + esc(venue.name) + '</h3><p>' + esc(venue.location) + ' · Até ' + esc(venue.capacity) + ' pessoas</p><div class="detail-actions">' + (venue.id === 'acacia' ? '<a class="btn btn--outline" href="detalhes-salao.html?id=acacia"><i class="bx bx-show"></i> Ver página</a>' : '') + '<button class="btn btn--navy" type="button" data-toggle-my-venue="' + esc(venue.id) + '">' + (venue.status === 'published' ? 'Marcar indisponível' : 'Publicar espaço') + '</button></div></div></article>'; }).join('') : empty('bx-building-house', 'Sem salões associados', 'A administração ainda não associou um salão a esta conta.');
    document.querySelectorAll('[data-toggle-my-venue]').forEach(function (button) { button.onclick = function () { var venue = adminVenues.find(function (item) { return item.id === button.dataset.toggleMyVenue; }); if (!venue) return; venue.status = venue.status === 'published' ? 'hidden' : 'published'; localStorage.setItem('espacon_admin_venues', JSON.stringify(adminVenues)); renderOwnerSections(); window.EspacoOn.toast(venue.status === 'published' ? 'Espaço publicado.' : 'Espaço marcado como indisponível.'); }; });

    var clients = []; requests.forEach(function (r) { var key=r.clientId||String(r.email||'').toLowerCase()||String(r.phone||'');var group=clients.find(function(c){return c.key===key;});if(group)group.requests.push(r);else clients.push({key:key,profile:r,requests:[r]}); });
    document.getElementById('ownerClients').innerHTML = clients.length ? '<div class="card owner-client-table"><div class="owner-client-table__summary"><div><strong>'+clients.length+' cliente(s)</strong><span>Com solicitações nos seus salões</span></div></div><div class="owner-client-table__head"><span>Cliente</span><span>Contactos</span><span>Solicitações</span><span>Última actividade</span><span>Acções</span></div>'+clients.map(function(group){var r=group.profile;var latest=group.requests.slice().sort(function(a,b){return new Date(b.createdAt||b.date)-new Date(a.createdAt||a.date);})[0];var avatar=(r.client||'C').split(' ').slice(0,2).map(function(p){return p[0];}).join('').toUpperCase();return '<article class="owner-client-table__row"><div class="owner-client-identity"><span class="avatar">'+esc(avatar)+'</span><span><strong>'+esc(r.client)+'</strong><small>'+esc(r.clientId||'Cliente registado')+'</small></span></div><div class="owner-client-contacts"><span><i class="bx bx-envelope"></i>'+esc(r.email||'Sem e-mail')+'</span><span><i class="bx bx-phone"></i>'+esc(r.phone||'Sem telefone')+'</span></div><span class="owner-client-count">'+group.requests.length+'</span><div><strong>'+formatDate(latest.date)+'</strong><small>'+esc(latest.venue)+'</small></div><a class="btn btn--outline" href="dashboard-proprietario-visitas.html?view=detail&visit='+encodeURIComponent(latest.id)+'">Ver pedidos</a></article>';}).join('')+'</div>' : empty('bx-user', 'Sem clientes', 'Os clientes com pedidos de visita aparecerão aqui.');

    var eligible = requests.filter(function (r) { return Boolean(r.eventDetails) && !r.noInterestReason; });
    document.getElementById('ownerProposals').innerHTML = (eligible.length ? eligible.map(function (r) { var proposal=proposals.find(function(p){return p.visitId===r.id;});var services=(r.eventDetails.services||[]).join(', ')||'Sem serviços selecionados'; return '<article class="card owner-record"><div class="owner-record__icon"><i class="bx bx-file"></i></div><div><strong>' + esc(r.client) + ' · ' + esc(r.venue) + '</strong><p>'+esc(services)+'</p><small>' + (proposal ? 'Proposta: MZN ' + esc(proposal.amount) + ' · pagamento único de 100%' : 'Cliente interessado · proposta por preparar') + '</small></div><button class="btn ' + (proposal ? 'btn--outline' : 'btn--primary') + '" type="button" data-proposal="' + esc(r.id) + '">' + (proposal ? 'Atualizar' : 'Criar proposta') + '</button></article>'; }).join('') : empty('bx-file', 'Sem propostas', 'As solicitações de clientes interessados aparecerão aqui.'));
    document.querySelectorAll('[data-proposal]').forEach(function (button) { button.onclick=function(){ var amount=prompt('Indique o valor total da proposta em MZN (pagamento único de 100%):'); if (!amount) return; var request=requests.find(function(item){return item.id===button.dataset.proposal;});var found=proposals.find(function(p){return p.visitId===button.dataset.proposal;}); if(found){found.amount=amount;found.status='pending';found.paymentStatus='not_started';}else proposals.push({visitId:button.dataset.proposal,amount:amount,status:'pending',paymentStatus:'not_started',services:request&&request.eventDetails?(request.eventDetails.services||[]).join(', '):''}); localStorage.setItem('espacon_owner_proposals',JSON.stringify(proposals));var stored=JSON.parse(localStorage.getItem('espacon_visit_requests')||'[]');var storedRequest=stored.find(function(item){return item.id===button.dataset.proposal;});if(storedRequest){storedRequest.negotiationStatus='proposal_sent';storedRequest.messages=storedRequest.messages||[];storedRequest.messages.push({author:'owner',text:'Enviei uma proposta no valor total de MZN '+amount+', com pagamento único de 100%.',at:new Date().toISOString()});localStorage.setItem('espacon_visit_requests',JSON.stringify(stored));} renderOwnerSections(); window.EspacoOn.toast('Proposta enviada ao cliente.'); }; });

    document.getElementById('ownerPayments').innerHTML = proposals.length ? proposals.map(function (p) { var r=requests.find(function(item){return item.id===p.visitId;});var paid=p.paymentStatus==='paid'; return '<article class="card owner-record"><div class="owner-record__icon"><i class="bx bx-wallet"></i></div><div><strong>' + esc(r ? r.client : p.visitId) + '</strong><p>' + esc(r ? r.venue : 'Reserva') + ' · pagamento único de 100%</p></div><strong>MZN ' + esc(p.amount) + '</strong><span class="badge '+(paid?'badge--ok':'badge--warn')+'">'+(paid?'Pago integralmente':p.status==='accepted'?'Aguardando pagamento':'Proposta em análise')+'</span></article>'; }).join('') : empty('bx-wallet', 'Sem pagamentos', 'Os valores das propostas e reservas aparecerão aqui.');
    var uniqueClients=clients.length, confirmed=requests.filter(function(r){return r.status==='confirmed';}).length, completed=requests.filter(function(r){return r.status==='completed';}).length;
    document.getElementById('ownerReports').innerHTML = '<article class="card metric"><div class="metric__head"><span>Total de pedidos</span><i class="bx bx-calendar"></i></div><strong>' + requests.length + '</strong></article><article class="card metric"><div class="metric__head"><span>Clientes atendidos</span><i class="bx bx-user"></i></div><strong>' + uniqueClients + '</strong></article><article class="card metric"><div class="metric__head"><span>Visitas confirmadas</span><i class="bx bx-calendar-check"></i></div><strong>' + confirmed + '</strong></article><article class="card metric"><div class="metric__head"><span>Visitas realizadas</span><i class="bx bx-check-circle"></i></div><strong>' + completed + '</strong></article>';
  }

  function openOwnerView(name) {
    document.querySelectorAll('[data-owner-panel]').forEach(function (panel) { panel.hidden = panel.dataset.ownerPanel !== name; });
    document.querySelectorAll('[data-owner-view]').forEach(function (link) { if (link.dataset.ownerView === name) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    location.hash = name === 'overview' ? 'visao-geral' : name;
    window.scrollTo({top:0,behavior:'smooth'});
  }
  document.querySelectorAll('[data-owner-view]').forEach(function (link) { link.onclick=function(event){event.preventDefault();openOwnerView(link.dataset.ownerView);}; });
  document.querySelector('#agendaBlockForm [name="date"]').min=new Date().toISOString().slice(0,10);
  document.getElementById('agendaBlockForm').addEventListener('submit',function(event){event.preventDefault();if(!event.target.reportValidity())return;var data=Object.fromEntries(new FormData(event.target));var blocks=JSON.parse(localStorage.getItem(AVAILABILITY_KEY)||'[]');blocks.push({id:'BLOCK-'+Date.now(),ownerId:session&&session.userId,venueId:data.venueId,date:data.date,time:data.time,reason:data.reason.trim(),createdAt:new Date().toISOString()});localStorage.setItem(AVAILABILITY_KEY,JSON.stringify(blocks));event.target.reset();renderOwnerSections();window.EspacoOn.toast('Data bloqueada e disponibilidade atualizada para os clientes.');});
  renderOwnerSections();
  var ownerHash={ '#agenda':'agenda','#reservas':'reservations','#meus-saloes':'venues','#clientes':'clients','#propostas':'proposals','#pagamentos':'payments','#relatorios':'reports' };
  openOwnerView(ownerHash[location.hash] || 'overview');

  if (!window.ApexCharts) return;

  var navy = '#0b3049';
  var orange = '#f47a20';
  var axisStyle = { colors: '#7b909f', fontSize: '11px' };

  var revenue = document.getElementById('revenueChart');
  if (revenue) {
    new ApexCharts(revenue, {
      chart: {
        type: 'area',
        height: 270,
        toolbar: { show: false },
        fontFamily: 'Inter, "Segoe UI", sans-serif'
      },
      series: [
        { name: 'Receita', data: [620, 710, 680, 830, 790, 920, 890, 1010, 1080, 1170, 1130, 1250] },
        { name: 'Despesas', data: [380, 420, 390, 480, 450, 510, 490, 560, 590, 610, 580, 640] }
      ],
      colors: [navy, orange],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2.5 },
      fill: { type: 'solid', opacity: 0.08 },
      grid: { borderColor: '#eff4f7', strokeDashArray: 4, padding: { left: 4, right: 4 } },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: axisStyle }
      },
      yaxis: {
        labels: {
          style: axisStyle,
          formatter: function (value) {
            return value >= 1000 ? (value / 1000).toFixed(1) + 'M' : value + 'k';
          }
        }
      },
      legend: { show: false },
      tooltip: {
        shared: true,
        y: {
          formatter: function (value) {
            return 'MZN ' + value + '.000';
          }
        }
      }
    }).render();
  }

  var occupancy = document.getElementById('occupancyChart');
  if (occupancy) {
    new ApexCharts(occupancy, {
      chart: { type: 'donut', height: 175, fontFamily: 'Inter, "Segoe UI", sans-serif' },
      series: [42, 28, 20, 10],
      labels: ['Salão Nobre', 'Auditório', 'Jardim', 'Terraço'],
      colors: [navy, orange, '#1d5578', '#dbe5ea'],
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 2, colors: ['#fff'] },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: { fontSize: '11px', color: '#7b909f', offsetY: 14 },
              value: {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#0d2334',
                offsetY: -10
              },
              total: {
                show: true,
                label: 'Ocupação',
                formatter: function () {
                  return '78%';
                }
              }
            }
          }
        }
      }
    }).render();
  }
});
