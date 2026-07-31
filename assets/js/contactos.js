/* Envio simulado do formulário de contacto. */

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    window.EspacoOn.toast('Mensagem enviada. A nossa equipa entrará em contacto consigo.');
    form.reset();
  });
});
