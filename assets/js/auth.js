/* Mostrar ou esconder a senha nos formulários de acesso. */

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-toggle-password]').forEach(function (button) {
    var input = document.getElementById(button.dataset.togglePassword);
    if (!input) return;

    button.addEventListener('click', function () {
      var hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      button.setAttribute('aria-label', hidden ? 'Esconder senha' : 'Mostrar senha');
      button.querySelector('i').className = hidden ? 'bx bx-hide' : 'bx bx-show';
    });
  });
});
