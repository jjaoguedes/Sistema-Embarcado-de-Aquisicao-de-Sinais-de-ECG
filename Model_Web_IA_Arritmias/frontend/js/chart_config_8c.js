// Função genérica para criar um gráfico de rosca
function createDoughnutChart(chartId, initialProbabilities, colors) {
    const ctx = document.getElementById(chartId).getContext('2d');

    // Garante que valores zero tenham pelo menos um tamanho mínimo para renderizar bordas
    const adjustedProbabilities = initialProbabilities.map(value => (value === 0 ? 0.01 : value));
    const remainingValue = 100 - adjustedProbabilities[0]; // Calcula o restante para completar 100%

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [adjustedProbabilities[0], remainingValue], // Dados com diferença
                backgroundColor: [colors, '#C0C0C0'], // A cor do gráfico e o restante (cinza)
                borderColor: '#000000', // Cor da borda
                borderWidth: 0.5 // Largura da borda para visibilidade
            }]
        },
        options: {
            responsive: false,
            hover: {
                mode: null, // Desativa o efeito de hover
                animationDuration: 0,
            },
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
                    enabled: false
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            },
            plugins: {
                // Plugin para exibir texto central
                doughnutCenterText: {
                    display: true,
                    text: `${adjustedProbabilities[0]}%`, // Mostra o primeiro valor como exemplo
                    font: {
                        size: '16',
                        weight: 'bold',
                        family: "'Arial', sans-serif"
                    },
                    color: '#000'
                }
            }
        },
        plugins: [{
            id: 'doughnutCenterText',
            beforeDraw(chart, args, options) {
                if (options.display) {
                    const { width } = chart;
                    const ctx = chart.ctx;
                    const text = options.text;
                    const fontSize = options.font.size;
                    const fontWeight = options.font.weight;
                    const fontFamily = options.font.family;
                    const textColor = options.color;

                    ctx.save();
                    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = textColor;
                    ctx.fillText(text, width / 2, chart.chartArea.height / 2 + chart.chartArea.top);
                    ctx.restore();
                }
            }
        }]
    });
}

// Exemplo de uso com ajuste de borda para valores zero
const myDoughnutChart0 = createDoughnutChart('DoughnutChart_8c_0', [12.5], ['rgb(0, 175, 108)']);
const myDoughnutChart1 = createDoughnutChart('DoughnutChart_8c_1', [12.5], ['rgb(255, 255, 0)']);
const myDoughnutChart2 = createDoughnutChart('DoughnutChart_8c_2', [12.5], ['rgb(255, 165, 0)']);
const myDoughnutChart3 = createDoughnutChart('DoughnutChart_8c_3', [12.5], ['rgb(22, 76, 94)']);
const myDoughnutChart4 = createDoughnutChart('DoughnutChart_8c_4', [12.5], ['rgb(138, 43, 226)']);
const myDoughnutChart5 = createDoughnutChart('DoughnutChart_8c_5', [12.5], ['rgb(255, 0, 0)']);
const myDoughnutChart6 = createDoughnutChart('DoughnutChart_8c_6', [12.5], ['rgb(255, 105, 180)']);
const myDoughnutChart7 = createDoughnutChart('DoughnutChart_8c_7', [12.5], ['rgb(66, 66, 153)']);
