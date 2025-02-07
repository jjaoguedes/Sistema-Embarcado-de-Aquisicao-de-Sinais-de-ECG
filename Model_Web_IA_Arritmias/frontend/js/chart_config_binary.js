const ctx_binary = document.getElementById('DoughnutChart_cb').getContext('2d');

const myDoughnutChart = new Chart(ctx_binary, {
    type: 'doughnut',
    data: {
        labels: ['Normal', 'Abnormal'],
        datasets: [{
            data: [50, 50], // Dados ajustados
            backgroundColor: [
                'rgb(0, 175, 108)', // Cor para "Normal"
                'rgb(194, 36, 36)'  // Cor para "Anormal"
            ],
            borderColor: '#000000', // Cor das bordas
            borderWidth: 0 // Largura da borda para destaque
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
                enabled: false
            }
        },
        layout: {
            padding: {
                top: 10, // Espaçamento acima do gráfico
                bottom: 10 // Espaçamento abaixo do gráfico
            }
        },
        cutout: '60%', // Ajuste para maior corte interno
        plugins: {
            doughnutCenterText: {
                display: true,
                text: '50%', // Texto inicial (exemplo: probabilidade inicial)
                font: {
                    size: '16', // Tamanho da fonte
                    weight: 'bold', // Peso da fonte
                    family: "'Arial', sans-serif" // Fonte personalizada
                },
                color: '#000' // Cor do texto
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

                // Configurações de renderização do texto
                ctx.save();
                ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = textColor;

                // Calcula a posição central e desenha o texto
                ctx.fillText(
                    text,
                    width / 2,
                    chart.chartArea.height / 2 + chart.chartArea.top
                );
                ctx.restore();
            }
        }
    }]
});
