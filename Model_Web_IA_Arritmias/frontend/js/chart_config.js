// Configurações do gráfico

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
            borderColor: '#FFFFFF',
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
                    color: '#FFFFFF',
                    lineWidth: 0.0
                },
                ticks: {
                    color: '#FFFFFF',
                }
            },
            x: {
                title: {
                    display: false
                },
                min: 0,
                max: maxSamples,
                ticks: {
                    color: '#FFFFFF',
                    display: false // Oculta os rótulos para maior realismo
                },
                grid: {
                    color: '#FFFFFF',
                    lineWidth: 0.0
                }
            }
        },
        plugins: {
            legend: {
                display: false
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