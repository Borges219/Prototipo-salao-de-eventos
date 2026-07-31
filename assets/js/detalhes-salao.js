/* Página de detalhe: dados do salão, galeria e pedido de visita. */

document.addEventListener('DOMContentLoaded', function () {
  var STORAGE_KEY = 'espacon_visit_requests';

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
      type: 'Eventos sociais · Ao ar livre',
      location: 'Matola Rio, Matola',
      rating: '4,8',
      reviews: '64 avaliações',
      description:
        'Um jardim amplo para celebrações ao ar livre, com áreas cobertas de apoio e flexibilidade para diferentes estilos de decoração.',
      dimension: '1.200 m²',
      capacity: 'Até 180 pessoas',
      price: 'Desde 95.000 MZN',
      parking: '55 viaturas',
      services: [
        'Jardim e pérgola',
        'Área coberta',
        'Iluminação exterior',
        'Casas de banho',
        'Tenda (opcional)',
        'Som (opcional)'
      ]
    },

    baia: {
      name: 'Baía Lounge',
      type: 'Eventos sociais e corporativos · Premium',
      location: 'Costa do Sol, Maputo',
      rating: '4,7',
      reviews: '51 avaliações',
      description:
        'Um espaço contemporâneo com vista privilegiada, adequado para galas, lançamentos, receções e eventos corporativos de maior dimensão.',
      dimension: '900 m²',
      capacity: 'Até 500 pessoas',
      price: 'Desde 280.000 MZN',
      parking: '120 viaturas',
      services: [
        'Climatização',
        'Palco e projeção',
        'Internet',
        'Cozinha profissional',
        'Audiovisual (opcional)',
        'Catering (opcional)'
      ]
    }
  };

  var photos = [
    { src: '../assets/images/portal-hero.png', caption: 'Vista principal' },
    { src: '../assets/images/landing-slide-1.jpg', caption: 'Interior decorado' },
    { src: '../assets/images/landing-slide-2.jpg', caption: 'Interior sem decoração' },
    { src: '../assets/images/vista-frontal.jpeg', caption: 'Vista frontal' },
    { src: '../assets/images/landing-slide-3.jpg', caption: 'Área lateral' }
  ];

  var venueId = new URLSearchParams(window.location.search).get('id');
  var venue = venues[venueId] || venues.acacia;

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
  dateInput.min = new Date().toISOString().slice(0, 10);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var request = {
      id: 'VIS-' + Date.now().toString().slice(-6),
      venueId: venueId || 'acacia',
      venue: venue.name,
      ownerId: 'owner-' + (venueId || 'acacia'),
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

    var stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    stored.unshift(request);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    window.EspacoOn.toast('Pedido ' + request.id + ' enviado. O responsável pelo ' + venue.name + ' foi notificado.');
    form.reset();
  });
});
