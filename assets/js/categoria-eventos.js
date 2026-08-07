/* Preenche a página de categoria a partir do parâmetro "tipo" do endereço. */

document.addEventListener('DOMContentLoaded', function () {
  var categories = {
    social: {
      eyebrow: 'Celebrações e momentos especiais',
      title: 'Eventos sociais',
      photo: '../assets/images/landing-slide-1.jpg',
      description:
        'Encontre salões pensados para celebrar com família e amigos, desde encontros intimistas até grandes receções.',
      tags: ['Casamentos', 'Aniversários', 'Graduações'],
      benefits: [
        ['bx-check-shield', 'Espaços verificados'],
        ['bx-palette', 'Decoração flexível'],
        ['bx-group', '30 a 500 convidados']
      ],
      guidance:
        'Considere o número de convidados, o estilo da celebração, os serviços incluídos e as regras de horário antes de solicitar uma proposta.',
      checklist: [
        'Capacidade e disposição das mesas',
        'Catering, decoração e entretenimento',
        'Estacionamento e acessibilidade'
      ],
      venues: [
        {
          id: 'acacia',
          name: 'Salão Acácia',
          place: 'Sommerschield, Maputo',
          capacity: 'Até 350 pessoas',
          price: 'Desde 185.000 MZN',
          label: 'Casamentos',
          photo: '../assets/images/salao-acacia-destaque-web.jpg'
        },
        {
          id: 'baia',
          name: 'Baía Lounge',
          place: 'Costa do Sol, Maputo',
          capacity: 'Até 500 pessoas',
          price: 'Desde 280.000 MZN',
          label: 'Frente-mar',
          photo: '../assets/images/baia-salao-praia-ai.jpg'
        },
        {
          id: 'safira', name: 'Salão Safira', place: 'Polana, Maputo', capacity: 'Até 220 pessoas',
          price: 'Desde 140.000 MZN', label: 'Celebrações', photo: '../assets/images/safira-destaque-ai.jpg'
        },
        {
          id: 'perola', name: 'Espaço Pérola', place: 'Triunfo, Maputo', capacity: 'Até 160 pessoas',
          price: 'Desde 110.000 MZN', label: 'Aniversários', photo: '../assets/images/perola-destaque-ai.jpg'
        },
        {
          id: 'quinta', name: 'Quinta das Palmeiras', place: 'Marracuene', capacity: 'Até 400 pessoas',
          price: 'Desde 175.000 MZN', label: 'Ao ar livre', photo: '../assets/images/quinta-destaque-ai.jpg'
        },
        {
          id: 'terraco', name: 'Terraço Índico', place: 'Marginal, Maputo', capacity: 'Até 140 pessoas',
          price: 'Desde 125.000 MZN', label: 'Receções', photo: '../assets/images/terraco-destaque-ai.jpg'
        },
        {
          id: 'villa', name: 'Villa Mahotas', place: 'Mahotas, Maputo', capacity: 'Até 300 pessoas',
          price: 'Desde 155.000 MZN', label: 'Graduações', photo: '../assets/images/villa-destaque-ai.jpg'
        },
        {
          id: 'moringa', name: 'Salão Moringa', place: 'Sommerschield II, Maputo', capacity: 'Até 260 pessoas',
          price: 'Desde 150.000 MZN', label: 'Celebrações', photo: '../assets/images/moringa-destaque-ai.jpg'
        },
        {
          id: 'zambeze', name: 'Jardim Zambeze', place: 'Albasine, Maputo', capacity: 'Até 340 pessoas',
          price: 'Desde 135.000 MZN', label: 'Ao ar livre', photo: '../assets/images/zambeze-destaque-ai.jpg'
        }
      ]
    },

    corporativo: {
      eyebrow: 'Negócios, conhecimento e conexões',
      title: 'Eventos corporativos',
      photo: '../assets/images/landing-slide-2.jpg',
      description:
        'Descubra ambientes profissionais para reunir equipas, apresentar ideias, formar pessoas e receber parceiros.',
      tags: ['Conferências', 'Formações', 'Lançamentos'],
      benefits: [
        ['bx-wifi', 'Internet disponível'],
        ['bx-slideshow', 'Recursos audiovisuais'],
        ['bx-group', '10 a 600 participantes']
      ],
      guidance:
        'Avalie os recursos audiovisuais, a qualidade da internet, a configuração da sala e os serviços de apoio aos participantes.',
      checklist: [
        'Projeção, som e microfones',
        'Internet estável e apoio técnico',
        'Coffee break e área de credenciamento'
      ],
      venues: [
        {
          id: 'ndlovu', name: 'Jardim Ndlovu', place: 'Matola Rio, Matola', capacity: 'Até 180 participantes',
          price: 'Desde 95.000 MZN', label: 'Corporativo', photo: '../assets/images/ndlovu-conferencia-vazia-ai.jpg'
        },
        {
          id: 'auditorio-maputo', name: 'Auditório Maputo', place: 'Baixa, Maputo', capacity: 'Até 500 participantes',
          price: 'Desde 210.000 MZN', label: 'Conferências', photo: '../assets/images/auditorio-maputo-destaque-ai.jpg'
        },
        {
          id: 'sala-indico', name: 'Sala Índico', place: 'Polana, Maputo', capacity: 'Até 80 participantes',
          price: 'Desde 65.000 MZN', label: 'Reuniões', photo: '../assets/images/sala-indico-destaque-ai.jpg'
        },
        {
          id: 'centro-matola', name: 'Centro Matola', place: 'Matola, Maputo', capacity: 'Até 300 participantes',
          price: 'Desde 145.000 MZN', label: 'Congressos', photo: '../assets/images/centro-matola-destaque-ai.jpg'
        },
        {
          id: 'hub-baixa', name: 'Hub Baixa', place: 'Baixa, Maputo', capacity: 'Até 120 participantes',
          price: 'Desde 85.000 MZN', label: 'Networking', photo: '../assets/images/hub-baixa-destaque-ai.jpg'
        },
        {
          id: 'centro-polana', name: 'Centro Polana', place: 'Polana Cimento, Maputo', capacity: 'Até 200 participantes',
          price: 'Desde 120.000 MZN', label: 'Formações', photo: '../assets/images/centro-polana-destaque-ai.jpg'
        },
        {
          id: 'pavilhao-katembe', name: 'Pavilhão KaTembe', place: 'KaTembe, Maputo', capacity: 'Até 600 participantes',
          price: 'Desde 240.000 MZN', label: 'Lançamentos', photo: '../assets/images/pavilhao-katembe-destaque-ai.jpg'
        },
        {
          id: 'business-sommerschield', name: 'Business Center Sommerschield', place: 'Sommerschield, Maputo', capacity: 'Até 150 participantes',
          price: 'Desde 105.000 MZN', label: 'Reuniões', photo: '../assets/images/business-sommerschield-destaque-ai.jpg'
        },
        {
          id: 'centro-kampfumo', name: 'Centro de Conferências KaMpfumo', place: 'KaMpfumo, Maputo', capacity: 'Até 420 participantes',
          price: 'Desde 195.000 MZN', label: 'Conferências', photo: '../assets/images/centro-kampfumo-destaque-ai.jpg'
        }
      ]
    }
  };

  var type = new URLSearchParams(window.location.search).get('tipo') === 'corporativo' ? 'corporativo' : 'social';
  var category = categories[type];

  document.title = category.title + ' | Espaço ON';
  var categoryPhoto = new URL(category.photo, document.baseURI).href;
  document.getElementById('categoryHero').style.setProperty('--hero-photo', 'url("' + categoryPhoto + '")');
  document.getElementById('categoryEyebrow').textContent = category.eyebrow;
  document.getElementById('categoryTitle').textContent = category.title;
  document.getElementById('categoryDescription').textContent = category.description;
  document.getElementById('categoryGuidance').textContent = category.guidance;
  document.getElementById('venueSectionTitle').textContent = 'Salões para ' + category.title.toLowerCase();
  document.getElementById('venueCount').textContent = category.venues.length + ' opções em destaque';

  document.getElementById('categoryTags').innerHTML = category.tags
    .map(function (tag) {
      return '<span>' + tag + '</span>';
    })
    .join('');

  document.getElementById('categoryBenefits').innerHTML = category.benefits
    .map(function (benefit) {
      return '<span><i class="bx ' + benefit[0] + '"></i>' + benefit[1] + '</span>';
    })
    .join('');

  document.getElementById('categoryChecklist').innerHTML = category.checklist
    .map(function (item) {
      return '<li><i class="bx bx-check"></i>' + item + '</li>';
    })
    .join('');

  document.getElementById('categoryVenueGrid').innerHTML = category.venues
    .map(function (venue) {
      return [
        '<article class="venue-card">',
        '  <div class="venue-card__photo">',
        '    <img src="' + venue.photo + '" alt="' + venue.name + '">',
        '  </div>',
        '  <div class="venue-card__body">',
        '    <h3>' + venue.name + '</h3>',
        '    <p class="venue-card__place"><i class="bx bx-map"></i> ' + venue.place + '</p>',
        '    <div class="venue-card__facts">',
        '      <span><i class="bx bx-group"></i> ' + venue.capacity + '</span>',
        '      <strong>' + venue.price + '</strong>',
        '    </div>',
        '    <a class="btn btn--outline btn--block" href="detalhes-salao.html?id=' + venue.id + '">Ver detalhes</a>',
        '  </div>',
        '</article>'
      ].join('');
    })
    .join('');
});
