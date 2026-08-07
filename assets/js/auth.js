/* Mostrar ou esconder a senha nos formulários de acesso. */

document.addEventListener('DOMContentLoaded', function () {
  var defaultOwners = [
    { id:'owner-acacia', name:'Manuel António', phone:'+258 84 100 1001', email:'manuel.acacia@espacoon.co.mz', password:'AcaciaON2026', status:'active' },
    { id:'owner-ndlovu', name:'Sara Ndlovu', phone:'+258 84 100 1002', email:'sara.ndlovu@espacoon.co.mz', password:'NdlovuON2026', status:'active' },
    { id:'owner-baia', name:'Carlos Mucavele', phone:'+258 84 100 1003', email:'carlos.baia@espacoon.co.mz', password:'BaiaON2026', status:'active' }
  ];
  var storedOwners = JSON.parse(localStorage.getItem('espacon_owners') || '[]');
  defaultOwners.forEach(function (account) { var current=storedOwners.find(function(item){return item.id===account.id;}); if(current)Object.assign(current,account);else storedOwners.push(account); });
  localStorage.setItem('espacon_owners',JSON.stringify(storedOwners));
  var defaultVenues=[{id:'acacia',name:'Salão Acácia',ownerId:'owner-acacia',location:'Sommerschield, Maputo',capacity:350,price:185000,type:'social',status:'published'},{id:'ndlovu',name:'Jardim Ndlovu',ownerId:'owner-ndlovu',location:'Matola Rio, Matola',capacity:180,price:95000,type:'corporativo',status:'published'},{id:'baia',name:'Baía Lounge',ownerId:'owner-baia',location:'Costa do Sol, Maputo',capacity:500,price:280000,type:'social',status:'published'}];
  var storedVenues=JSON.parse(localStorage.getItem('espacon_admin_venues')||'[]');defaultVenues.forEach(function(venue){var current=storedVenues.find(function(item){return item.id===venue.id;});if(current)Object.assign(current,venue);else storedVenues.push(venue);});localStorage.setItem('espacon_admin_venues',JSON.stringify(storedVenues));
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

  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    var pendingRegistration = null;
    var registerOtpForm = document.getElementById('registerOtpForm');
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!registerForm.reportValidity()) return;
      var data = Object.fromEntries(new FormData(registerForm));
      var error = document.getElementById('registerError');
      var emailError = document.getElementById('registerEmailError');
      var phoneError = document.getElementById('registerPhoneError');
      error.textContent = ''; emailError.textContent = ''; phoneError.textContent = '';
      var email = data.email.trim().toLowerCase();
      var phone = data.phone.replace(/\D/g, '');
      if (!email && !phone) { error.textContent = 'Informe pelo menos um e-mail ou número de telefone.'; return; }
      if (data.password !== data.confirmation) { error.textContent = 'As senhas não coincidem. Confirme novamente.'; return; }
      var clients = JSON.parse(localStorage.getItem('espacon_clients') || '[]');
      var emailTaken = email && (email === 'admin@espacoon.co.mz' || clients.some(function(item){return String(item.email||'').toLowerCase()===email;}) || storedOwners.some(function(item){return String(item.email||'').toLowerCase()===email;}));
      var phoneTaken = phone && (clients.some(function(item){return String(item.phone||'').replace(/\D/g,'')===phone;}) || storedOwners.some(function(item){return String(item.phone||'').replace(/\D/g,'')===phone;}));
      if (emailTaken) emailError.textContent = 'Este e-mail já está registado no sistema.';
      if (phoneTaken) phoneError.textContent = 'Este telefone já está registado no sistema.';
      if (emailTaken || phoneTaken) return;
      pendingRegistration = data;
      registerForm.classList.add('is-hidden');
      registerOtpForm.classList.remove('is-hidden');
      document.getElementById('registerOtpDestination').textContent = 'Enviámos o código para ' + [data.email, data.phone].filter(Boolean).join(' e ') + '.';
      registerOtpForm.elements.otp.focus();
    });
    registerOtpForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!registerOtpForm.reportValidity() || !pendingRegistration) return;
      if (registerOtpForm.elements.otp.value !== '246810') { document.getElementById('registerOtpError').textContent = 'Código inválido. Para esta demonstração, use 246810.'; return; }
      var clients = JSON.parse(localStorage.getItem('espacon_clients') || '[]');
      var client = { id:'client-'+Date.now(), name:pendingRegistration.name.trim(), email:pendingRegistration.email.trim().toLowerCase(), phone:pendingRegistration.phone.trim(), password:pendingRegistration.password, active:true, verifiedAt:new Date().toISOString(), createdAt:new Date().toISOString() };
      clients.push(client);
      localStorage.setItem('espacon_clients', JSON.stringify(clients));
      localStorage.setItem('espacon_session', JSON.stringify({ role:'client', userId:client.id, name:client.name, email:client.email }));
      window.location.href = '../telas/dashboard-cliente.html';
    });
    document.getElementById('backToRegister').addEventListener('click', function () { registerOtpForm.classList.add('is-hidden'); registerForm.classList.remove('is-hidden'); });
  }

  var loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;

    var identifier = loginForm.elements.identifier.value.trim().toLowerCase();
    var password = loginForm.elements.password.value;
    var error = document.getElementById('loginError');

    if (identifier === 'admin@espacoon.co.mz' && password === 'AdminON2026') {
      localStorage.setItem('espacon_session', JSON.stringify({ role: 'admin', userId: 'admin-platform', name: 'Amélia Manuel', email: identifier }));
      window.location.href = '../telas/dashboard-admin.html';
      return;
    }

    var owners = JSON.parse(localStorage.getItem('espacon_owners') || '[]');
    var ownerAccount = owners.find(function (item) { return item.email.toLowerCase() === identifier && item.password === password; });
    if (ownerAccount) {
      if (ownerAccount.status === 'suspended') { error.textContent = 'Esta conta de proprietário está suspensa. Contacte a administração.'; return; }
      localStorage.setItem('espacon_session', JSON.stringify({ role: 'owner', userId: ownerAccount.id, name: ownerAccount.name, email: ownerAccount.email }));
      window.location.href = '../telas/dashboard-administrativo.html';
      return;
    }

    if (identifier === 'proprietario@espacoon.co.mz' && password === 'EspacoON2026') {
      if (localStorage.getItem('espacon_owner_suspended') === 'true') {
        error.textContent = 'Esta conta de proprietário está suspensa. Contacte a administração.';
        return;
      }
      localStorage.setItem('espacon_session', JSON.stringify({ role: 'owner', userId: 'owner-acacia', name: 'Manuel António', email: identifier }));
      window.location.href = '../telas/dashboard-administrativo.html';
      return;
    }

    var clients = JSON.parse(localStorage.getItem('espacon_clients') || '[]');
    var client = clients.slice().reverse().find(function (item) {
      return String(item.email || '').toLowerCase() === identifier || String(item.phone || '').replace(/\s/g, '') === identifier.replace(/\s/g, '');
    });
    if (client && client.active && client.password === password) {
      localStorage.setItem('espacon_session', JSON.stringify({ role: 'client', userId: client.id, name: client.name, email: client.email }));
      var pendingFavorite = localStorage.getItem('espacon_pending_favorite');
      if (pendingFavorite) {
        var favorites = JSON.parse(localStorage.getItem('espacon_favorites') || '{}');
        favorites[client.id] = favorites[client.id] || [];
        if (!favorites[client.id].includes(pendingFavorite)) favorites[client.id].push(pendingFavorite);
        localStorage.setItem('espacon_favorites', JSON.stringify(favorites));
        localStorage.removeItem('espacon_pending_favorite');
      }
      window.location.href = '../telas/dashboard-cliente.html' + (pendingFavorite ? '#favoritos' : '');
      return;
    }

    error.textContent = 'Credenciais inválidas. Verifique o e-mail e a senha.';
  });
});
