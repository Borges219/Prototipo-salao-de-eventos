document.addEventListener('DOMContentLoaded', function () {
  const menu = document.getElementById('portalMenu');
  const nav = document.getElementById('portalNav');
  const toast = document.getElementById('portalToast');

  menu.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });

  document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault();
    toast.textContent = 'Mensagem enviada. A nossa equipa entrará em contacto consigo.';
    toast.classList.add('show');
    event.currentTarget.reset();
    window.setTimeout(function () { toast.classList.remove('show'); }, 3500);
  });
});
