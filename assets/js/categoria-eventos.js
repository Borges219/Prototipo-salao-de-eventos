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
          photo: '../assets/images/landing-slide-1.jpg'
        },
        {
          id: 'ndlovu',
          name: 'Jardim Ndlovu',
          place: 'Matola Rio, Matola',
          capacity: 'Até 180 pessoas',
          price: 'Desde 95.000 MZN',
          label: 'Ao ar livre',
          photo: '../assets/images/landing-slide-3.jpg'
        },
        {
          id: 'baia',
          name: 'Casa da Baía',
          place: 'Costa do Sol, Maputo',
          capacity: 'Até 280 pessoas',
          price: 'Desde 165.000 MZN',
          label: 'Aniversários',
          photo: '../assets/images/landing-slide-2.jpg'
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
          id: 'baia',
          name: 'Auditório Maputo',
          place: 'Baixa, Maputo',
          capacity: 'Até 500 participantes',
          price: 'Desde 210.000 MZN',
          label: 'Conferências',
          photo: '../assets/images/landing-slide-2.jpg'
        },
        {
          id: 'acacia',
          name: 'Sala Índico',
          place: 'Polana, Maputo',
          capacity: 'Até 80 participantes',
          price: 'Desde 65.000 MZN',
          label: 'Reuniões',
          photo: '../assets/images/landing-slide-3.jpg'
        },
        {
          id: 'ndlovu',
          name: 'Centro Matola',
          place: 'Matola, Maputo',
          capacity: 'Até 300 participantes',
          price: 'Desde 145.000 MZN',
          label: 'Congressos',
          photo: '../assets/images/landing-slide-1.jpg'
        }
      ]
    }
  };

  var type = new URLSearchParams(window.location.search).get('tipo') === 'corporativo' ? 'corporativo' : 'social';
  var category = categories[type];

  document.title = category.title + ' | Espaço ON';
  document.getElementById('categoryHero').style.setProperty('--hero-photo', 'url("' + category.photo + '")');
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
        '  <div class="venue-card__photo" style="--photo:url(\'' + venue.photo + '\')">',
        '    <span>' + venue.label + '</span>',
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
