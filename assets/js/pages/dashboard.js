document.addEventListener("DOMContentLoaded", function () {
     if (!window.ApexCharts) return;

     var revenueTarget = document.querySelector("#events-revenue-chart");
     if (revenueTarget) {
          new ApexCharts(revenueTarget, {
               chart: {
                    height: 312,
                    type: "area",
                    toolbar: { show: false }
               },
               series: [
                    {
                         name: "Receita",
                         data: [42, 58, 51, 74, 88, 93, 106, 118, 126, 139, 151, 164]
                    },
                    {
                         name: "Reservas",
                         data: [18, 22, 20, 27, 31, 34, 39, 42, 41, 46, 49, 53]
                    }
               ],
               colors: ["#1bb394", "#1e84c4"],
               dataLabels: { enabled: false },
               stroke: { curve: "smooth", width: 3 },
               fill: {
                    type: "gradient",
                    gradient: {
                         opacityFrom: .32,
                         opacityTo: .04,
                         stops: [0, 90]
                    }
               },
               grid: {
                    borderColor: "rgba(132, 134, 167, .18)",
                    strokeDashArray: 3
               },
               xaxis: {
                    categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
               },
               yaxis: {
                    labels: {
                         formatter: function (value) {
                              return value + "k";
                         }
                    }
               },
               tooltip: {
                    shared: true
               }
          }).render();
     }

     var typeTarget = document.querySelector("#event-types-chart");
     if (typeTarget) {
          new ApexCharts(typeTarget, {
               chart: {
                    height: 270,
                    type: "donut"
               },
               series: [38, 27, 21, 14],
               labels: ["Casamentos", "Corporativos", "Formaturas", "Sociais"],
               colors: ["#1bb394", "#1e84c4", "#f8ac59", "#7f56da"],
               legend: {
                    position: "bottom"
               },
               dataLabels: {
                    enabled: false
               },
               stroke: {
                    width: 0
               },
               plotOptions: {
                    pie: {
                         donut: {
                              size: "72%"
                         }
                    }
               }
          }).render();
     }
});
