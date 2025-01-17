// Array com os nomes das classes
const classNames = [
    "Normal Beat",
    "Atrial Premature\nContraction", // Rótulo longo quebrado em duas linhas
    "Ventricular Escape Beat",
    "Left Bundle\nBranch Block Beat", // Quebra manual para melhorar o layout
    "Right Bundle\nBranch Block Beat",
    "Premature Ventricular",
    "Ventricular Flutter Wave",
    "Paced Beat"
];

// Inicialização do gráfico de 8 classes
const ctx_8c = document.getElementById('DoughnutChart_8c').getContext('2d');
const myDoughnutChart_8c = new Chart(ctx_8c, {
    type: 'doughnut',
    data: {
        labels: classNames,
        datasets: [{
            data: [12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5], // Valores iniciais (serão atualizados dinamicamente)
            backgroundColor: [
                'rgb(0, 175, 108)', // Cor para "Normal"
                'rgb(255, 255, 0)',
                'rgb(255, 165, 0)',
                'rgb(22, 76, 94)',
                'rgb(138, 43, 226)',
                'rgb(255, 0, 0)',
                'rgb(255, 105, 180)',
                'rgb(66, 66, 153)'
            ],
            borderColor: [
                'rgb(0, 175, 108)', // Cor para "Normal"
                'rgb(255, 255, 0)',
                'rgb(255, 165, 0)',
                'rgb(22, 76, 94)',
                'rgb(138, 43, 226)',
                'rgb(255, 0, 0)',
                'rgb(255, 105, 180)',
               'rgb(66, 66, 153)'
            ],
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