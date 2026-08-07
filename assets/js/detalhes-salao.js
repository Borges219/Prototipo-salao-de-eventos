/* Página de detalhe: dados do salão, galeria e pedido de visita. */

document.addEventListener('DOMContentLoaded', function () {
  var STORAGE_KEY = 'espacon_visit_requests';
  var CLIENTS_KEY = 'espacon_clients';
  var SESSION_KEY = 'espacon_session';
  var DEMO_OTP = '246810';
  var session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
  var bookingFromProfile = new URLSearchParams(window.location.search).get('source') === 'profile';
  var venueOwners = { acacia: 'owner-acacia', ndlovu: 'owner-ndlovu', baia: 'owner-baia' };

  var venues = {
    acacia: {
      name: 'Salão Acácia',
      type: 'Eventos sociais · Casamentos',
      location: 'Sommerschield, KaMpfumo',
      rating: '4,9',
      reviews: '86 avaliações',
      description:
        'Um salão elegante e versátil, com ambientes interiores amplos e uma área preparada para cerimónias, receções e pista de dança.',
      dimension: '620 m²',
      capacity: 'Até 350 pessoas',
      price: 'Desde 185.000 MZN',
      parking: '80 viaturas',
      services: [
        'Climatização',
        'Cozinha de apoio',
        'Mobiliário',
        'Gerador de emergência',
        'Decoração (opcional)',
        'Catering (opcional)'
      ]
    },

    ndlovu: {
      name: 'Jardim Ndlovu',
      type: 'Eventos corporativos · Espaço empresarial',
      location: 'Matola Rio, Matola',
      rating: '4,8',
      reviews: '64 avaliações',
      description:
        'Um espaço empresarial versátil para conferências, formações, reuniões executivas, networking e lançamentos de produtos, com salas equipadas e áreas exteriores de apoio.',
      dimension: '1.200 m²',
      capacity: 'Até 180 pessoas',
      price: 'Desde 95.000 MZN',
      parking: '55 viaturas',
      services: [
        'Sala de conferências',
        'Sala de formação',
        'Sala de reuniões',
        'Internet de alta velocidade',
        'Projector e sistema de som',
        'Área para networking',
        'Catering empresarial (opcional)'
      ]
    },

    baia: {
      name: 'Baía Lounge',
      type: 'Eventos sociais e corporativos · Frente-mar',
      location: 'Costa do Sol, Maputo',
      rating: '4,7',
      reviews: '51 avaliações',
      description:
        'Um espaço contemporâneo em frente à praia, com salão envidraçado, terraço coberto e acesso directo ao areal. Preparado para casamentos, galas, receções, lançamentos e eventos corporativos com vista para o Oceano Índico.',
      dimension: '1.050 m²',
      capacity: 'Até 500 pessoas',
      price: 'Desde 280.000 MZN',
      parking: '120 viaturas',
      services: [
        'Climatização',
        'Terraço frente-mar',
        'Acesso directo à praia',
        'Palco e audiovisual',
        'Internet de alta velocidade',
        'Cozinha profissional',
        'Gerador de emergência',
        'Catering (opcional)'
      ]
    }
  };

  Object.assign(venues, {
    safira: {
      name: 'Salão Safira', type: 'Eventos sociais · Celebrações', location: 'Polana, Maputo', rating: '4,8', reviews: '72 avaliações',
      description: 'Um salão elegante para casamentos, aniversários e receções, com configuração flexível e ambiente contemporâneo.',
      dimension: '520 m²', capacity: 'Até 220 pessoas', price: 'Desde 140.000 MZN', parking: '60 viaturas', gallery: 'social',
      services: ['Climatização', 'Cozinha de apoio', 'Mobiliário', 'Gerador', 'Decoração (opcional)', 'Catering (opcional)']
    },
    perola: {
      name: 'Espaço Pérola', type: 'Eventos sociais · Aniversários', location: 'Triunfo, Maputo', rating: '4,6', reviews: '48 avaliações',
      description: 'Um espaço acolhedor para festas privadas e encontros familiares, com lounge, bar e área exterior integrada.',
      dimension: '410 m²', capacity: 'Até 160 pessoas', price: 'Desde 110.000 MZN', parking: '45 viaturas', gallery: 'beach',
      services: ['Lounge', 'Bar de apoio', 'Climatização', 'Som ambiente', 'Decoração (opcional)', 'Catering (opcional)']
    },
    quinta: {
      name: 'Quinta das Palmeiras', type: 'Eventos sociais · Ao ar livre', location: 'Marracuene', rating: '4,7', reviews: '59 avaliações',
      description: 'Uma quinta ampla e arborizada para celebrações ao ar livre, com área coberta e várias possibilidades de montagem.',
      dimension: '2.400 m²', capacity: 'Até 400 pessoas', price: 'Desde 175.000 MZN', parking: '110 viaturas', gallery: 'social',
      services: ['Jardim', 'Área coberta', 'Cozinha de apoio', 'Estacionamento', 'Tenda (opcional)', 'Iluminação (opcional)']
    },
    terraco: {
      name: 'Terraço Índico', type: 'Eventos sociais · Receções', location: 'Marginal, Maputo', rating: '4,7', reviews: '43 avaliações',
      description: 'Um terraço contemporâneo com vista aberta, ideal para receções, cocktails, jantares e celebrações intimistas.',
      dimension: '380 m²', capacity: 'Até 140 pessoas', price: 'Desde 125.000 MZN', parking: '40 viaturas', gallery: 'beach',
      services: ['Terraço coberto', 'Bar', 'Som ambiente', 'Iluminação', 'Mobiliário', 'Catering (opcional)']
    },
    villa: {
      name: 'Villa Mahotas', type: 'Eventos sociais · Graduações', location: 'Mahotas, Maputo', rating: '4,5', reviews: '37 avaliações',
      description: 'Uma villa espaçosa para graduações, aniversários e encontros familiares, com salão interior e jardim reservado.',
      dimension: '760 m²', capacity: 'Até 300 pessoas', price: 'Desde 155.000 MZN', parking: '75 viaturas', gallery: 'social',
      services: ['Salão interior', 'Jardim', 'Cozinha', 'Gerador', 'Mobiliário', 'Decoração (opcional)']
    },
    'auditorio-maputo': {
      name: 'Auditório Maputo', type: 'Eventos corporativos · Conferências', location: 'Baixa, Maputo', rating: '4,8', reviews: '91 avaliações',
      description: 'Auditório equipado para conferências, apresentações e assembleias de grande dimensão, com apoio técnico permanente.',
      dimension: '980 m²', capacity: 'Até 500 participantes', price: 'Desde 210.000 MZN', parking: '90 viaturas', gallery: 'corporate',
      services: ['Palco', 'Projeção', 'Sistema de som', 'Microfones', 'Internet', 'Apoio técnico']
    },
    'sala-indico': {
      name: 'Sala Índico', type: 'Eventos corporativos · Reuniões', location: 'Polana, Maputo', rating: '4,7', reviews: '54 avaliações',
      description: 'Sala executiva reservada para reuniões estratégicas, apresentações e encontros de direção.',
      dimension: '210 m²', capacity: 'Até 80 participantes', price: 'Desde 65.000 MZN', parking: '35 viaturas', gallery: 'corporate',
      services: ['Videoconferência', 'Ecrã', 'Internet', 'Climatização', 'Coffee break', 'Receção']
    },
    'centro-matola': {
      name: 'Centro Matola', type: 'Eventos corporativos · Congressos', location: 'Matola, Maputo', rating: '4,6', reviews: '62 avaliações',
      description: 'Centro modular para congressos, formações e encontros empresariais, com várias configurações de sala.',
      dimension: '820 m²', capacity: 'Até 300 participantes', price: 'Desde 145.000 MZN', parking: '100 viaturas', gallery: 'corporate',
      services: ['Salas modulares', 'Audiovisual', 'Internet', 'Credenciamento', 'Coffee break', 'Estacionamento']
    },
    'hub-baixa': {
      name: 'Hub Baixa', type: 'Eventos corporativos · Networking', location: 'Baixa, Maputo', rating: '4,6', reviews: '41 avaliações',
      description: 'Espaço urbano para networking, workshops, painéis e encontros de equipas, com ambiente flexível e informal.',
      dimension: '340 m²', capacity: 'Até 120 participantes', price: 'Desde 85.000 MZN', parking: '25 viaturas', gallery: 'corporate',
      services: ['Internet', 'Projeção', 'Som', 'Mobiliário flexível', 'Lounge', 'Coffee break']
    },
    'centro-polana': {
      name: 'Centro Polana', type: 'Eventos corporativos · Formações', location: 'Polana Cimento, Maputo', rating: '4,7', reviews: '46 avaliações',
      description: 'Centro de formação com salas iluminadas, equipamento audiovisual e apoio para programas empresariais.',
      dimension: '460 m²', capacity: 'Até 200 participantes', price: 'Desde 120.000 MZN', parking: '50 viaturas', gallery: 'corporate',
      services: ['Salas de formação', 'Projectores', 'Internet', 'Flipcharts', 'Climatização', 'Coffee break']
    },
    'pavilhao-katembe': {
      name: 'Pavilhão KaTembe', type: 'Eventos corporativos · Lançamentos', location: 'KaTembe, Maputo', rating: '4,7', reviews: '35 avaliações',
      description: 'Pavilhão de grande dimensão para lançamentos, feiras, exposições e eventos de marca com produção personalizada.',
      dimension: '1.600 m²', capacity: 'Até 600 participantes', price: 'Desde 240.000 MZN', parking: '160 viaturas', gallery: 'corporate',
      services: ['Palco modular', 'Audiovisual', 'Internet', 'Área de exposição', 'Gerador', 'Apoio técnico']
    },
    moringa: {
      name: 'Salão Moringa', type: 'Eventos sociais', location: 'Sommerschield II, Maputo', rating: '4,7', reviews: '44 avaliações',
      description: 'Salão contemporâneo para casamentos, aniversários e receções, com ambiente acolhedor e configuração flexível.',
      dimension: '590 m²', capacity: 'Até 260 pessoas', price: 'Desde 150.000 MZN', parking: '65 viaturas', gallery: 'social',
      services: ['Climatização', 'Mobiliário', 'Cozinha de apoio', 'Gerador', 'Decoração (opcional)', 'Catering (opcional)']
    },
    zambeze: {
      name: 'Jardim Zambeze', type: 'Eventos sociais', location: 'Albasine, Maputo', rating: '4,6', reviews: '39 avaliações',
      description: 'Jardim amplo para celebrações, receções e encontros familiares, com área coberta e estacionamento reservado.',
      dimension: '1.850 m²', capacity: 'Até 340 pessoas', price: 'Desde 135.000 MZN', parking: '95 viaturas', gallery: 'social',
      services: ['Jardim', 'Área coberta', 'Iluminação exterior', 'Estacionamento', 'Tenda (opcional)', 'Catering (opcional)']
    },
    'business-sommerschield': {
      name: 'Business Center Sommerschield', type: 'Eventos corporativos', location: 'Sommerschield, Maputo', rating: '4,8', reviews: '58 avaliações',
      description: 'Centro empresarial moderno para reuniões, formações e apresentações, com salas modulares e suporte técnico.',
      dimension: '480 m²', capacity: 'Até 150 participantes', price: 'Desde 105.000 MZN', parking: '55 viaturas', gallery: 'corporate',
      services: ['Videoconferência', 'Projectores', 'Internet', 'Climatização', 'Receção', 'Coffee break']
    },
    'centro-kampfumo': {
      name: 'Centro de Conferências KaMpfumo', type: 'Eventos corporativos', location: 'KaMpfumo, Maputo', rating: '4,8', reviews: '67 avaliações',
      description: 'Centro de conferências preparado para congressos, lançamentos e grandes encontros profissionais.',
      dimension: '1.150 m²', capacity: 'Até 420 participantes', price: 'Desde 195.000 MZN', parking: '130 viaturas', gallery: 'corporate',
      services: ['Auditório', 'Palco', 'Audiovisual', 'Internet', 'Credenciamento', 'Apoio técnico']
    }
  });

  var defaultPhotos = [
    { src: '../assets/images/vista-principal.png', caption: 'Vista principal' },
    { src: '../assets/images/salao-decorado.jpeg', caption: 'Interior decorado' },
    { src: '../assets/images/salao-vazio.jpeg', caption: 'Interior sem decoração' },
    { src: '../assets/images/vista-frontal.jpeg', caption: 'Vista frontal' },
    { src: '../assets/images/vista-lateral.jpeg', caption: 'Área lateral' }
  ];

  var corporatePhotos = [
    { src: '../assets/images/ndlovu-conferencia-vazia-ai.jpg', caption: 'Conferência corporativa' },
    { src: '../assets/images/ndlovu-formacao-vazia-ai.jpg', caption: 'Formação empresarial' },
    { src: '../assets/images/ndlovu-reuniao-vazia-ai.jpg', caption: 'Reunião executiva' },
    { src: '../assets/images/ndlovu-networking-vazio-ai.jpg', caption: 'Receção e networking' },
    { src: '../assets/images/ndlovu-lancamento-vazio-ai.jpg', caption: 'Lançamento de produto' }
  ];

  var beachPhotos = [
    { src: '../assets/images/baia-salao-praia-ai.jpg', caption: 'Salão principal com vista para o mar' },
    { src: '../assets/images/baia-terraco-praia-ai.jpg', caption: 'Terraço para receções ao pôr do sol' },
    { src: '../assets/images/baia-cerimonia-praia-ai.jpg', caption: 'Cerimónia junto à praia' },
    { src: '../assets/images/baia-lounge-praia-ai.jpg', caption: 'Lounge e bar frente-mar' },
    { src: '../assets/images/baia-exterior-praia-ai.jpg', caption: 'Vista exterior do Baía Lounge' }
  ];

  var venueCovers = {
    acacia: '../assets/images/salao-acacia-destaque-web.jpg',
    baia: '../assets/images/baia-salao-praia-ai.jpg',
    safira: '../assets/images/safira-destaque-ai.jpg',
    perola: '../assets/images/perola-destaque-ai.jpg',
    quinta: '../assets/images/quinta-destaque-ai.jpg',
    terraco: '../assets/images/terraco-destaque-ai.jpg',
    villa: '../assets/images/villa-destaque-ai.jpg',
    moringa: '../assets/images/moringa-destaque-ai.jpg',
    zambeze: '../assets/images/zambeze-destaque-ai.jpg',
    ndlovu: '../assets/images/ndlovu-conferencia-vazia-ai.jpg',
    'auditorio-maputo': '../assets/images/auditorio-maputo-destaque-ai.jpg',
    'sala-indico': '../assets/images/sala-indico-destaque-ai.jpg',
    'centro-matola': '../assets/images/centro-matola-destaque-ai.jpg',
    'hub-baixa': '../assets/images/hub-baixa-destaque-ai.jpg',
    'centro-polana': '../assets/images/centro-polana-destaque-ai.jpg',
    'pavilhao-katembe': '../assets/images/pavilhao-katembe-destaque-ai.jpg',
    'business-sommerschield': '../assets/images/business-sommerschield-destaque-ai.jpg',
    'centro-kampfumo': '../assets/images/centro-kampfumo-destaque-ai.jpg'
  };

  var venueId = new URLSearchParams(window.location.search).get('id');
  var venue = venues[venueId] || venues.acacia;
  var galleryType = venue.gallery || (venueId === 'ndlovu' ? 'corporate' : venueId === 'baia' ? 'beach' : 'social');
  var photos = (galleryType === 'corporate' ? corporatePhotos : galleryType === 'beach' ? beachPhotos : defaultPhotos).slice();
  if (venueCovers[venueId]) photos[0] = { src: venueCovers[venueId], caption: 'Vista principal de ' + venue.name };

  function fill(id, value) {
    document.getElementById(id).textContent = value;
  }

  document.title = venue.name + ' | Espaço ON';
  fill('venueType', venue.type);
  fill('venueName', venue.name);
  fill('venueLocation', venue.location);
  fill('venueRating', venue.rating);
  fill('venueReviews', venue.reviews);
  fill('venueAboutTitle', 'Conheça o ' + venue.name);
  fill('venueDescription', venue.description);
  fill('venueDimension', venue.dimension);
  fill('venueCapacity', venue.capacity);
  fill('venuePrice', venue.price);
  fill('venueParking', venue.parking);
  fill('basePrice', venue.price);

  document.getElementById('venueServices').innerHTML = venue.services
    .map(function (service) {
      return '<span><i class="bx bx-check"></i>' + service + '</span>';
    })
    .join('');

  /* Galeria com ampliação. */
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightboxImage');
  var lightboxCaption = document.getElementById('lightboxCaption');

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('is-locked');
  }

  document.querySelectorAll('#gallery button').forEach(function (button) {
    var photo = photos[Number(button.dataset.index)];
    button.style.backgroundImage = 'url("' + photo.src + '")';
    button.querySelector('span').textContent = photo.caption;

    button.addEventListener('click', function () {
      lightboxImage.src = photo.src;
      lightboxCaption.textContent = photo.caption;
      lightbox.hidden = false;
      document.body.classList.add('is-locked');
    });
  });

  document.getElementById('closeLightbox').addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  /* Pedido de visita guardado localmente para a área do proprietário ler. */
  var form = document.getElementById('visitForm');
  var dateInput = document.getElementById('visitDate');
  var pendingRequest = null;
  var activationClient = null;
  var otpModal = document.getElementById('otpModal');
  var otpForm = document.getElementById('otpForm');
  var activationForm = document.getElementById('visitActivationForm');
  var timeInput = document.getElementById('visitTime');
  dateInput.min = new Date().toISOString().slice(0, 10);

  function resetVisitFlow() {
    form.reset();
    dateInput.setCustomValidity('');
    pendingRequest = null;
    activationClient = null;
    otpModal.hidden = true;
    otpForm.hidden = false;
    activationForm.hidden = true;
    document.body.classList.remove('is-locked');
    document.getElementById('otpTitle').textContent = 'Confirme o seu telefone';
    document.getElementById('otpIntro').hidden = false;
    document.getElementById('visitOtpDemo').hidden = false;
    document.querySelectorAll('#visitForm .form-error, #otpModal .form-error').forEach(function (message) { message.textContent = ''; });
    document.querySelectorAll('#otpModal input').forEach(function (input) { input.value = ''; if (input.name === 'password' || input.name === 'confirmation') input.type = 'password'; });
  }

  resetVisitFlow();
  window.addEventListener('pageshow', function (event) { if (event.persisted) resetVisitFlow(); });

  function checkAvailability() {
    var date = dateInput.value;
    var time = timeInput.value;
    var error = document.getElementById('visitAvailabilityError');
    if (!date || !time) { error.textContent = ''; dateInput.setCustomValidity(''); return true; }
    var blocks = JSON.parse(localStorage.getItem('espacon_venue_blocks') || '[]');
    var requests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    var proposals = JSON.parse(localStorage.getItem('espacon_owner_proposals') || '[]');
    var manuallyBlocked = blocks.some(function (block) { return block.venueId === venueId && block.date === date && (!block.time || block.time === time); });
    var occupiedByVisit = requests.some(function (request) { return request.venueId === venueId && request.date === date && request.time === time && ['confirmed','rescheduled'].includes(request.status); });
    var occupiedByReservation = requests.some(function (request) { var proposal=proposals.find(function(item){return item.visitId===request.id;});return request.venueId===venueId&&request.date===date&&proposal&&proposal.status==='accepted'; });
    var unavailable = manuallyBlocked || occupiedByVisit || occupiedByReservation;
    error.textContent = unavailable ? 'Esta data ou horário já está ocupado. Escolha outra disponibilidade.' : '';
    dateInput.setCustomValidity(unavailable ? 'Data indisponível' : '');
    return !unavailable;
  }

  dateInput.addEventListener('change', checkAvailability);
  timeInput.addEventListener('change', checkAvailability);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!checkAvailability() || !form.reportValidity()) return;

    var clients = JSON.parse(window.localStorage.getItem(CLIENTS_KEY) || '[]');
    var email = document.getElementById('visitEmail').value.trim().toLowerCase();
    var phone = document.getElementById('visitPhone').value.replace(/\D/g, '');
    var emailAccount = clients.find(function (item) { return String(item.email || '').trim().toLowerCase() === email; });
    var phoneAccount = clients.find(function (item) { return String(item.phone || '').replace(/\D/g, '') === phone; });
    var owners = JSON.parse(window.localStorage.getItem('espacon_owners') || '[]');
    var professionalAccount = owners.find(function (item) { return String(item.email || '').trim().toLowerCase() === email || String(item.phone || '').replace(/\D/g, '') === phone; });
    var accountError = document.getElementById('visitAccountError');
    var emailFieldError = document.getElementById('visitEmailError');
    var phoneFieldError = document.getElementById('visitPhoneError');
    accountError.textContent = '';
    emailFieldError.textContent = '';
    phoneFieldError.textContent = '';
    if (email === 'admin@espacoon.co.mz' || email === 'proprietario@espacoon.co.mz' || professionalAccount) {
      if (email === 'admin@espacoon.co.mz' || email === 'proprietario@espacoon.co.mz' || (professionalAccount && String(professionalAccount.email || '').toLowerCase() === email)) emailFieldError.textContent = 'Este e-mail já está registado no sistema.';
      if (professionalAccount && String(professionalAccount.phone || '').replace(/\D/g, '') === phone) phoneFieldError.textContent = 'Este telefone já está registado no sistema.';
      return;
    }
    if (emailAccount && phoneAccount && emailAccount.id !== phoneAccount.id) {
      emailFieldError.textContent = 'Este e-mail já está registado noutra conta.';
      phoneFieldError.textContent = 'Este telefone já está registado noutra conta.';
      return;
    }
    if (emailAccount && String(emailAccount.phone || '').replace(/\D/g, '') !== phone) {
      emailFieldError.textContent = 'Este e-mail já está registado no sistema.';
      return;
    }
    if (phoneAccount && String(phoneAccount.email || '').trim().toLowerCase() !== email) {
      phoneFieldError.textContent = 'Este telefone já está registado no sistema.';
      return;
    }

    pendingRequest = {
      id: 'VIS-' + Date.now().toString().slice(-6),
      venueId: venueId || 'acacia',
      venue: venue.name,
      ownerId: venueOwners[venueId] || 'owner-acacia',
      client: document.getElementById('visitName').value.trim(),
      phone: document.getElementById('visitPhone').value.trim(),
      email: document.getElementById('visitEmail').value.trim(),
      date: dateInput.value,
      time: document.getElementById('visitTime').value,
      guests: Number(document.getElementById('visitGuests').value),
      notes: document.getElementById('visitNotes').value.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: []
    };

    if (bookingFromProfile && session && session.role === 'client') {
      pendingRequest.clientId = session.userId;
      var directRequests = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      directRequests.unshift(pendingRequest);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(directRequests));
      window.location.href = 'dashboard-cliente.html?visit=' + encodeURIComponent(pendingRequest.id);
      return;
    }

    document.getElementById('otpDestination').textContent = pendingRequest.phone;
    document.getElementById('otpCode').value = '';
    document.getElementById('otpError').textContent = '';
    otpModal.hidden = false;
    document.body.classList.add('is-locked');
    setTimeout(function () { document.getElementById('otpCode').focus(); }, 50);
  });

  document.getElementById('otpCancel').addEventListener('click', function () {
    otpModal.hidden = true;
    document.body.classList.remove('is-locked');
  });

  otpForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (document.getElementById('otpCode').value.trim() !== DEMO_OTP) {
      document.getElementById('otpError').textContent = 'Código inválido. Para esta demonstração, use 246810.';
      return;
    }

    var stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    stored.unshift(pendingRequest);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    var clients = JSON.parse(window.localStorage.getItem(CLIENTS_KEY) || '[]');
    var normalizedEmail = pendingRequest.email.toLowerCase();
    var normalizedPhone = pendingRequest.phone.replace(/\D/g, '');
    var client = clients.find(function (item) {
      return (normalizedEmail && String(item.email || '').toLowerCase() === normalizedEmail) || (normalizedPhone && String(item.phone || '').replace(/\D/g, '') === normalizedPhone);
    });
    var alreadyActive = Boolean(client && client.password);
    if (!client) {
      client = { id: 'client-' + Date.now(), name: pendingRequest.client, email: pendingRequest.email, phone: pendingRequest.phone, active: false, createdAt: new Date().toISOString() };
      clients.push(client);
    }
    window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));

    pendingRequest.clientId = client.id;
    stored[0] = pendingRequest;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    if (alreadyActive) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ role: 'client', userId: client.id, email: client.email, name: client.name }));
      window.location.href = 'dashboard-cliente.html?visit=' + encodeURIComponent(pendingRequest.id);
      return;
    }

    activationClient = client;
    otpForm.hidden = true;
    activationForm.hidden = false;
    document.getElementById('otpTitle').textContent = 'Proteja a sua conta';
    document.getElementById('otpIntro').hidden = true;
    document.getElementById('visitOtpDemo').hidden = true;
    setTimeout(function () { document.getElementById('visitPassword').focus(); }, 50);
  });

  activationForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!activationForm.reportValidity() || !activationClient) return;
    var password = activationForm.elements.password.value;
    var confirmation = activationForm.elements.confirmation.value;
    var error = document.getElementById('visitActivationError');
    if (password !== confirmation) { error.textContent = 'As senhas não coincidem. Confirme novamente.'; return; }
    var clients = JSON.parse(window.localStorage.getItem(CLIENTS_KEY) || '[]');
    var client = clients.find(function (item) { return item.id === activationClient.id; });
    if (!client) { error.textContent = 'Não foi possível localizar a conta criada.'; return; }
    client.password = password;
    client.active = true;
    client.verifiedAt = new Date().toISOString();
    window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ role:'client', userId:client.id, email:client.email, name:client.name }));
    window.location.href = 'dashboard-cliente.html?visit=' + encodeURIComponent(pendingRequest.id);
  });

  document.querySelectorAll('[data-visit-password]').forEach(function (button) {
    button.addEventListener('click', function () {
      var input = document.getElementById(button.dataset.visitPassword);
      var hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      button.querySelector('i').className = hidden ? 'bx bx-hide' : 'bx bx-show';
    });
  });
});
