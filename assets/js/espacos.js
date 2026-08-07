document.addEventListener('DOMContentLoaded', function () {
  var venues = [
    ['acacia','Salão Acácia','social','Sommerschield, Maputo',350,185000,'4,9','salao-acacia-destaque-web.jpg'],
    ['baia','Baía Lounge','social','Costa do Sol, Maputo',500,280000,'4,7','baia-salao-praia-ai.jpg'],
    ['safira','Salão Safira','social','Polana, Maputo',220,140000,'4,8','safira-destaque-ai.jpg'],
    ['perola','Espaço Pérola','social','Triunfo, Maputo',160,110000,'4,6','perola-destaque-ai.jpg'],
    ['quinta','Quinta das Palmeiras','social','Marracuene',400,175000,'4,7','quinta-destaque-ai.jpg'],
    ['terraco','Terraço Índico','social','Marginal, Maputo',140,125000,'4,7','terraco-destaque-ai.jpg'],
    ['villa','Villa Mahotas','social','Mahotas, Maputo',300,155000,'4,5','villa-destaque-ai.jpg'],
    ['moringa','Salão Moringa','social','Sommerschield II, Maputo',260,150000,'4,7','moringa-destaque-ai.jpg'],
    ['zambeze','Jardim Zambeze','social','Albasine, Maputo',340,135000,'4,6','zambeze-destaque-ai.jpg'],
    ['ndlovu','Jardim Ndlovu','corporativo','Matola Rio, Matola',180,95000,'4,8','ndlovu-conferencia-vazia-ai.jpg'],
    ['auditorio-maputo','Auditório Maputo','corporativo','Baixa, Maputo',500,210000,'4,8','auditorio-maputo-destaque-ai.jpg'],
    ['sala-indico','Sala Índico','corporativo','Polana, Maputo',80,65000,'4,7','sala-indico-destaque-ai.jpg'],
    ['centro-matola','Centro Matola','corporativo','Matola, Maputo',300,145000,'4,6','centro-matola-destaque-ai.jpg'],
    ['hub-baixa','Hub Baixa','corporativo','Baixa, Maputo',120,85000,'4,6','hub-baixa-destaque-ai.jpg'],
    ['centro-polana','Centro Polana','corporativo','Polana Cimento, Maputo',200,120000,'4,7','centro-polana-destaque-ai.jpg'],
    ['pavilhao-katembe','Pavilhão KaTembe','corporativo','KaTembe, Maputo',600,240000,'4,7','pavilhao-katembe-destaque-ai.jpg'],
    ['business-sommerschield','Business Center Sommerschield','corporativo','Sommerschield, Maputo',150,105000,'4,8','business-sommerschield-destaque-ai.jpg'],
    ['centro-kampfumo','Centro de Conferências KaMpfumo','corporativo','KaMpfumo, Maputo',420,195000,'4,8','centro-kampfumo-destaque-ai.jpg']
  ].map(function (v, index) { return { id:v[0], name:v[1], type:v[2], location:v[3], capacity:v[4], price:v[5], rating:v[6], photo:v[7], order:index }; });

  var search = document.getElementById('searchVenue');
  var type = document.getElementById('filterType');
  var city = document.getElementById('filterCity');
  var capacity = document.getElementById('filterCapacity');
  var price = document.getElementById('filterPrice');
  var sort = document.getElementById('sortVenues');
  var grid = document.getElementById('allVenueGrid');
  var empty = document.getElementById('catalogEmpty');

  function normalize(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  function money(value) { return new Intl.NumberFormat('pt-PT').format(value) + ' MZN'; }

  Array.from(new Set(venues.map(function (venue) { return venue.location; }))).sort().forEach(function (location) {
    city.insertAdjacentHTML('beforeend', '<option value="' + location + '">' + location + '</option>');
  });

  function render() {
    var term = normalize(search.value);
    var minimumCapacity = Number(capacity.value);
    var maximumPrice = Number(price.value);
    var results = venues.filter(function (venue) {
      return (!term || normalize(venue.name + ' ' + venue.location).includes(term)) &&
        (!type.value || venue.type === type.value) && (!city.value || venue.location === city.value) &&
        venue.capacity >= minimumCapacity && (!maximumPrice || venue.price <= maximumPrice);
    });

    results.sort(function (a, b) {
      if (sort.value === 'price-asc') return a.price - b.price;
      if (sort.value === 'price-desc') return b.price - a.price;
      if (sort.value === 'capacity-desc') return b.capacity - a.capacity;
      if (sort.value === 'rating-desc') return Number(b.rating.replace(',', '.')) - Number(a.rating.replace(',', '.'));
      return a.order - b.order;
    });

    var activeFilters = [];
    if (type.value) activeFilters.push(type.options[type.selectedIndex].text);
    if (city.value) activeFilters.push(city.value);
    if (minimumCapacity) activeFilters.push('mínimo de ' + minimumCapacity + ' pessoas');
    if (maximumPrice) activeFilters.push('até ' + money(maximumPrice));
    document.getElementById('resultsCount').textContent = results.length + (results.length === 1 ? ' espaço encontrado' : ' espaços encontrados') + (activeFilters.length ? ' · ' + activeFilters.join(' · ') : '');
    grid.innerHTML = results.map(function (venue) {
      var typeName = venue.type === 'social' ? 'Evento social' : 'Evento corporativo';
      return '<article class="venue-card">' +
        '<div class="venue-card__photo"><img src="../assets/images/' + venue.photo + '" alt="' + venue.name + '" loading="lazy"><span>' + typeName + '</span>' +
        '<button class="favorite" type="button" aria-label="Guardar ' + venue.name + '" aria-pressed="false"><i class="bx bx-heart"></i></button></div>' +
        '<div class="venue-card__body"><div class="venue-card__meta"><strong><i class="bx bxs-star"></i> ' + venue.rating + '</strong><span>' + typeName + '</span></div>' +
        '<h3>' + venue.name + '</h3><p class="venue-card__place"><i class="bx bx-map"></i>' + venue.location + '</p>' +
        '<div class="venue-card__facts"><span><i class="bx bx-group"></i> Até ' + venue.capacity + ' pessoas</span><strong>Desde ' + money(venue.price) + '</strong></div>' +
        '<a class="btn btn--outline btn--block" href="detalhes-salao.html?id=' + venue.id + '&origem=espacos">Ver detalhes</a></div></article>';
    }).join('');
    grid.hidden = results.length === 0;
    empty.hidden = results.length !== 0;
  }

  function clearAll() { search.value=''; type.value=''; city.value=''; capacity.value='0'; price.value='0'; sort.value='recommended'; render(); }
  sort.addEventListener('change', render);
  document.getElementById('applyFilters').addEventListener('click', render);
  document.getElementById('clearFilters').addEventListener('click', clearAll);
  document.getElementById('emptyClear').addEventListener('click', clearAll);
  render();
});
