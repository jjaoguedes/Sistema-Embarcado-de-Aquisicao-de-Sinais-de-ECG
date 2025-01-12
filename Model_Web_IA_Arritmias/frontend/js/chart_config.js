const maxSamples = 1600; // Número máximo de amostras exibidas no gráfico
const samplingRate = 360; // Frequência de amostragem em Hz
let displayedData = []; // Array para armazenar os dados exibidos no gráfico
const ctx = document.getElementById('ecgChart').getContext('2d');
const ecgChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'ECG',
            data: [],
            borderColor: '#0000000',
            borderWidth: 1.5,
            fill: false,
            pointRadius: 0,
        }]
    },
    options: {
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x', // Permite arrastar apenas no eixo X
                },
                zoom: {
                    enabled: true,
                    mode: 'x', // Zoom no eixo X
                }
            },
            legend: {
                display: false
            }
        },
        animation: {
            duration: 0
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',
                title: {
                    display: false
                },
                grid: {
                    color: '#CCCCCC', // Cor cinza para a grid no eixo Y
                    lineWidth: 1.0 // Largura das linhas
                },
                ticks: {
                    color: '#000000', // Cor preta para os valores do eixo Y
                }
            },
            x: {
                title: {
                    display: false
                },
                min: 0,
                max: maxSamples,
                ticks: {
                    color: '#000000', // Cor preta para os valores do eixo X
                    display: true // Exibe os rótulos no eixo X
                },
                grid: {
                    color: '#CCCCCC', // Cor cinza para a grid no eixo X
                    lineWidth: 1.0 // Largura das linhas
                }
            }
        },
        layout: {
            padding: 10
        },
        elements: {
            line: {
                tension: 0 // Linha reta para ECG
            }
        }
    }
});
