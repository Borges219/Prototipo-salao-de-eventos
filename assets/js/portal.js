document.addEventListener('DOMContentLoaded', function () {
  const menu = document.getElementById('portalMenu');
  const nav = document.getElementById('portalNav');
  const toast = document.getElementById('portalToast');

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  menu.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroDots = Array.from(document.querySelectorAll('.hero-dots button'));
  let currentSlide = 0;
  let slideTimer;

  function showSlide(index) {
    currentSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) { slide.classList.toggle('active', slideIndex === currentSlide); });
    heroDots.forEach(function (dot, dotIndex) { dot.classList.toggle('active', dotIndex === currentSlide); });
  }

  function restartSlides() {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(function () { showSlide(currentSlide + 1); }, 5000);
  }

  heroDots.forEach(function (dot) {
    dot.addEventListener('click', function () { showSlide(Number(dot.dataset.slide)); restartSlides(); });
  });
  restartSlides();

  document.querySelectorAll('.favorite').forEach(function (button) {
    button.addEventListener('click', function () {
      showToast('Crie uma conta para guardar espaços nos favoritos.');
      window.setTimeout(function () { window.location.href = '../auth/register.html'; }, 1200);
    });
  });
});
