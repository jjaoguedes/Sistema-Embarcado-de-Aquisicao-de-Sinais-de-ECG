// Função genérica para criar um gráfico de rosca
function createDoughnutChart(chartId, classNames, initialProbabilities, colors) {
    const ctx = document.getElementById(chartId).getContext('2d');
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: null,
            datasets: [{
                data: initialProbabilities,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    position: 'right',
                    align: 'start',
                    labels: {
                        boxWidth: 20,
                        font: {
                            size: 12,
                            family: "'Arial', sans-serif"
                        },
                        padding: 10
                    }
                },
                tooltip: {
                    enabled: true
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            }
        }
    });
}