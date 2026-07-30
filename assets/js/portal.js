document.addEventListener('DOMContentLoaded', function () {
  const menu = document.getElementById('portalMenu');
  const nav = document.getElementById('portalNav');
  const toast = document.getElementById('portalToast');
  const showToast = (message) => { toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 2600); };

  menu.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  const heroSlides = [...document.querySelectorAll('.hero-slide')];
  const heroDots = [...document.querySelectorAll('.hero-dots button')];
  let currentSlide = 0;
  let slideTimer;
  const showSlide = function (index) {
    currentSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) { slide.classList.toggle('active', slideIndex === currentSlide); });
    heroDots.forEach(function (dot, dotIndex) { dot.classList.toggle('active', dotIndex === currentSlide); });
  };
  const restartSlides = function () {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(function () { showSlide(currentSlide + 1); }, 5000);
  };
  heroDots.forEach(function (dot) { dot.addEventListener('click', function () { showSlide(Number(dot.dataset.slide)); restartSlides(); }); });
  restartSlides();

  document.querySelectorAll('.favorite').forEach(function (button) {
    button.addEventListener('click', function () {
      button.classList.toggle('saved');
      button.querySelector('i').className = button.classList.contains('saved') ? 'bx bxs-heart' : 'bx bx-heart';
      showToast(button.classList.contains('saved') ? 'Espaço guardado nos favoritos.' : 'Espaço removido dos favoritos.');
    });
  });

  const eventContent = {
    casamento: { kicker: 'Celebrações inesquecíveis', title: 'O espaço certo para o seu casamento', description: 'Encontre salões que combinam ambiente, capacidade e serviços para que a cerimónia e a receção aconteçam com tranquilidade.', ideal: 'Cerimónia, receção e copo-d’água', capacity: '100 a 500 convidados', features: ['Área para cerimónia e pista de dança', 'Catering, decoração e mobiliário', 'Estacionamento e espaço para fotografias'] },
    aniversario: { kicker: 'Celebre à sua maneira', title: 'Um aniversário com o ambiente certo', description: 'Compare espaços flexíveis para festas infantis, aniversários adultos ou celebrações familiares, dentro do seu estilo e orçamento.', ideal: 'Festas familiares e celebrações temáticas', capacity: '30 a 250 convidados', features: ['Área para entretenimento e música', 'Opções de catering e bolo', 'Horários e regras de som adequados'] },
    corporativo: { kicker: 'Negócios bem recebidos', title: 'Espaços que valorizam a sua empresa', description: 'Escolha locais funcionais e profissionais para reunir equipas, apresentar projetos, formar pessoas ou receber parceiros.', ideal: 'Reuniões, formações e lançamentos', capacity: '10 a 300 participantes', features: ['Internet estável e tomadas acessíveis', 'Projetor, som e apoio técnico', 'Coffee break e estacionamento'] },
    graduacao: { kicker: 'Uma conquista para recordar', title: 'Celebre a graduação com todos', description: 'Descubra espaços com capacidade e estrutura para reunir graduados, familiares e amigos num momento verdadeiramente especial.', ideal: 'Galas, cerimónias e festas de turma', capacity: '80 a 400 convidados', features: ['Palco e área para homenagens', 'Iluminação e serviço fotográfico', 'Pista de dança e catering'] },
    conferencia: { kicker: 'Ideias que encontram pessoas', title: 'Conferências com estrutura profissional', description: 'Encontre auditórios e salas preparados para proporcionar boa visibilidade, conforto e uma experiência fluida aos participantes.', ideal: 'Congressos, palestras e painéis', capacity: '50 a 600 participantes', features: ['Palco, púlpito e projeção', 'Som, microfones e apoio técnico', 'Receção, credenciamento e intervalos'] }
  };
  const eventModal = document.getElementById('eventInfoModal');
  const closeEventModal = function () { eventModal.hidden = true; document.body.classList.remove('modal-open'); };
  document.querySelectorAll('[data-event-info]').forEach(function (button) {
    button.addEventListener('click', function () {
      const content = eventContent[button.dataset.eventInfo];
      document.getElementById('eventModalKicker').textContent = content.kicker;
      document.getElementById('eventModalTitle').textContent = content.title;
      document.getElementById('eventModalDescription').textContent = content.description;
      document.getElementById('eventModalIdeal').textContent = content.ideal;
      document.getElementById('eventModalCapacity').textContent = content.capacity;
      document.getElementById('eventModalFeatures').innerHTML = content.features.map(function (feature) { return '<li><i class="bx bx-check"></i>' + feature + '</li>'; }).join('');
      eventModal.hidden = false;
      document.body.classList.add('modal-open');
      eventModal.querySelector('.event-modal-close').focus();
    });
  });
  document.querySelectorAll('[data-close-event-modal]').forEach(function (element) { element.addEventListener('click', closeEventModal); });
  document.getElementById('eventModalAction').addEventListener('click', closeEventModal);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !eventModal.hidden) closeEventModal(); });

});
