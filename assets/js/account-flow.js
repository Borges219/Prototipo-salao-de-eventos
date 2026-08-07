document.addEventListener('DOMContentLoaded', function () {
  var CLIENTS_KEY = 'espacon_clients';
  var SESSION_KEY = 'espacon_session';
  var OTP = '246810';

  function clients() { return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]'); }
  function save(items) { localStorage.setItem(CLIENTS_KEY, JSON.stringify(items)); }
  function sessionFor(client) { return { role: 'client', userId: client.id, name: client.name, email: client.email }; }

  var activationForm = document.getElementById('activationForm');
  if (activationForm) {
    var pending = JSON.parse(localStorage.getItem('espacon_pending_activation') || 'null');
    if (!pending) { window.location.href = 'login.html'; return; }

    activationForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!activationForm.reportValidity()) return;
      var password = activationForm.elements.password.value;
      var confirmation = activationForm.elements.confirmation.value;
      var error = document.getElementById('activationError');
      if (password !== confirmation) { error.textContent = 'As palavras-passe não coincidem.'; return; }
      var items = clients();
      var client = items.find(function (item) { return item.id === pending.clientId; });
      if (!client) { error.textContent = 'Não foi possível localizar a conta criada.'; return; }
      client.password = password;
      client.active = true;
      client.activatedAt = new Date().toISOString();
      save(items);
      localStorage.removeItem('espacon_pending_activation');
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionFor(client)));
      window.location.href = '../telas/dashboard-cliente.html?visit=' + encodeURIComponent(pending.visitId);
    });
  }

  var requestForm = document.getElementById('requestResetForm');
  var confirmForm = document.getElementById('confirmResetForm');
  var resetClientId = null;
  if (requestForm && confirmForm) {
    requestForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!requestForm.reportValidity()) return;
      var identifier = requestForm.elements.identifier.value.trim().toLowerCase();
      var client = clients().slice().reverse().find(function (item) { return String(item.email || '').toLowerCase() === identifier || String(item.phone || '').replace(/\s/g, '') === identifier.replace(/\s/g, ''); });
      if (!client) { document.getElementById('requestResetError').textContent = 'Não encontrámos uma conta com estes dados.'; return; }
      resetClientId = client.id;
      requestForm.classList.add('is-hidden');
      confirmForm.classList.remove('is-hidden');
      document.getElementById('resetIntro').textContent = 'Introduza o código recebido e escolha uma nova palavra-passe.';
    });

    confirmForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!confirmForm.reportValidity()) return;
      var error = document.getElementById('confirmResetError');
      if (confirmForm.elements.otp.value !== OTP) { error.textContent = 'Código inválido. Para esta demonstração, use 246810.'; return; }
      if (confirmForm.elements.password.value !== confirmForm.elements.confirmation.value) { error.textContent = 'As palavras-passe não coincidem.'; return; }
      var items = clients();
      var client = items.find(function (item) { return item.id === resetClientId; });
      if (!client) return;
      client.password = confirmForm.elements.password.value;
      client.active = true;
      save(items);
      window.location.href = 'login.html?password=updated';
    });
  }
});
