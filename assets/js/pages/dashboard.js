/* Gráficos do painel administrativo (ApexCharts vem do vendor.js). */

document.addEventListener('DOMContentLoaded', function () {
  if (!window.ApexCharts) return;

  var navy = '#0b3049';
  var orange = '#f47a20';
  var axisStyle = { colors: '#7b909f', fontSize: '11px' };

  var revenue = document.getElementById('revenueChart');
  if (revenue) {
    new ApexCharts(revenue, {
      chart: {
        type: 'area',
        height: 270,
        toolbar: { show: false },
        fontFamily: 'Inter, "Segoe UI", sans-serif'
      },
      series: [
        { name: 'Receita', data: [620, 710, 680, 830, 790, 920, 890, 1010, 1080, 1170, 1130, 1250] },
        { name: 'Despesas', data: [380, 420, 390, 480, 450, 510, 490, 560, 590, 610, 580, 640] }
      ],
      colors: [navy, orange],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2.5 },
      fill: { type: 'solid', opacity: 0.08 },
      grid: { borderColor: '#eff4f7', strokeDashArray: 4, padding: { left: 4, right: 4 } },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: axisStyle }
      },
      yaxis: {
        labels: {
          style: axisStyle,
          formatter: function (value) {
            return value >= 1000 ? (value / 1000).toFixed(1) + 'M' : value + 'k';
          }
        }
      },
      legend: { show: false },
      tooltip: {
        shared: true,
        y: {
          formatter: function (value) {
            return 'MZN ' + value + '.000';
          }
        }
      }
    }).render();
  }

  var occupancy = document.getElementById('occupancyChart');
  if (occupancy) {
    new ApexCharts(occupancy, {
      chart: { type: 'donut', height: 175, fontFamily: 'Inter, "Segoe UI", sans-serif' },
      series: [42, 28, 20, 10],
      labels: ['Salão Nobre', 'Auditório', 'Jardim', 'Terraço'],
      colors: [navy, orange, '#1d5578', '#dbe5ea'],
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 2, colors: ['#fff'] },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: { fontSize: '11px', color: '#7b909f', offsetY: 14 },
              value: {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#0d2334',
                offsetY: -10
              },
              total: {
                show: true,
                label: 'Ocupação',
                formatter: function () {
                  return '78%';
                }
              }
            }
          }
        }
      }
    }).render();
  }
});
