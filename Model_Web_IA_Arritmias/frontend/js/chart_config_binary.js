// Configuração do gráfico binário
const ctx_binary = document.getElementById('DoughnutChart_cb').getContext('2d');
const myDoughnutChart = new Chart(ctx_binary, {
    type: 'doughnut',
    data: {
        labels: ['Normal', 'Anormal'],
        datasets: [{
            data: [50, 50], // Substitua pelos valores reais, se necessário
            backgroundColor: [
                'rgb(0, 255, 0)', // Cor para "Normal"
                'rgb(255, 0, 0)'  // Cor para "Anormal"
            ],
            borderColor: [
                'rgb(0, 255, 0)',
                'rgb(255, 0, 0)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: false,
        plugins: {
            legend: {
                position: 'right', // Alternativa: 'top', 'bottom', 'left'
                align: 'start', // Alinhamento no início da posição
                labels: {
                    boxWidth: 20, // Largura da caixa de cor
                    font: {
                        size: 12, // Tamanho da fonte
                        family: "'Arial', sans-serif" // Fonte personalizada
                    },
                    padding: 10 // Espaçamento entre itens da legenda
                }
            },
            tooltip: {
                enabled: true
            }
        },
        layout: {
            padding: {
                top: 10, // Espaçamento acima do gráfico
                bottom: 10 // Espaçamento abaixo do gráfico
            }
        },
        cutout: '60%' // Ajuste para maior corte interno
    }
});
