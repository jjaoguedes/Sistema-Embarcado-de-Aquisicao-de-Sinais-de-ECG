// Funções relacionadas a classificação

const myDoughnutChart0 = createDoughnutChart('DoughnutChart_8c_0', ["Normal Beat"], [12.5], ['rgb(0, 175, 108)']);
const myDoughnutChart1 = createDoughnutChart('DoughnutChart_8c_1', ["Atrial Premature\nContraction"], [12.5], ['rgb(255, 255, 0)']);
const myDoughnutChart2 = createDoughnutChart('DoughnutChart_8c_2', ["Normal Beat"], [12.5], ['rgb(255, 165, 0)']);
const myDoughnutChart3 = createDoughnutChart('DoughnutChart_8c_3', ["Normal Beat"], [12.5], ['rgb(22, 76, 94)']);
const myDoughnutChart4 = createDoughnutChart('DoughnutChart_8c_4', ["Normal Beat"], [12.5], ['rgb(138, 43, 226)']);
const myDoughnutChart5 = createDoughnutChart('DoughnutChart_8c_5', ["Normal Beat"], [12.5], ['rgb(255, 0, 0)']);
const myDoughnutChart6 = createDoughnutChart('DoughnutChart_8c_6', ["Normal Beat"], [12.5], ['rgb(255, 105, 180)']);
const myDoughnutChart7 = createDoughnutChart('DoughnutChart_8c_7', ["Normal Beat"], [12.5], ['rgb(66, 66, 153)']);


// Função genérica para atualizar os dados de um gráfico de rosca
function updateChartData(chart, probabilities, color) {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.data.datasets[0].backgroundColor = []; // Cor correspondente
    chart.data.datasets[0].borderColor = []; // Cor correspondente

    chart.data.labels = [];
    chart.data.datasets[0].data = [probabilities];
    chart.data.datasets[0].backgroundColor = [color]; // Cor correspondente
    chart.data.datasets[0].borderColor = [color]; // Cor correspondente
    chart.update();
}

// Função para mostrar e atualizar um gráfico de 8 classes
function showGraph(chartId, spinnerId, probabilities, color) {
    toggleElementVisibility(chartId, true); // Mostra o gráfico
    toggleElementVisibility(spinnerId, false); // Oculta o spinner
    const chart = Chart.getChart(chartId);
    if (chart) {
        updateChartData(chart, probabilities, color);
    }
}

// Função para inicializar múltiplos gráficos
function initializeEightClassification(probabilities) {
    showGraph(myDoughnutChart0, 'SpinnerEightClassification', probabilities[0], ['rgb(0, 175, 108)']);
    showGraph(myDoughnutChart1, 'SpinnerEightClassification', probabilities[1], ['rgb(255, 255, 0)']);
    //showGraph(myDoughnutChart2, 'SpinnerEightClassification', probabilities[2]);
    //showGraph(myDoughnutChart3, 'SpinnerEightClassification', probabilities[3]);
    //showGraph(myDoughnutChart4, 'SpinnerEightClassification', probabilities[4]);
    //showGraph(myDoughnutChart5, 'SpinnerEightClassification', probabilities[5]);
    //showGraph(myDoughnutChart6, 'SpinnerEightClassification', probabilities[7]);
    //showGraph(myDoughnutChart7, 'SpinnerEightClassification', probabilities[8]);
    //DoughnutChart_8c_0
}

function updateBynaryData(label, color, probability) {

  // Atualizando os dados do gráfico binário
  myDoughnutChart.data.labels = [label]; // Apenas o rótulo da classe escolhida
  myDoughnutChart.data.datasets[0].data = [probability]; // Apenas a probabilidade da classe
  myDoughnutChart.data.datasets[0].backgroundColor = [color]; // Cor correspondente
  myDoughnutChart.data.datasets[0].borderColor = [color]; // Cor correspondente

  // Atualizando o gráfico binário
  myDoughnutChart.update();
}

function clearBinaryData() {

  myDoughnutChart.data.labels = []; // Apenas o rótulo da classe escolhida
  myDoughnutChart.data.datasets[0].data = []; // Apenas a probabilidade da classe
  myDoughnutChart.data.datasets[0].backgroundColor = []; // Cor correspondente
  myDoughnutChart.data.datasets[0].borderColor = []; // Cor correspondente
}

function showGraph_cb() {

  toggleElementVisibility('DoughnutChart_cb', true);
  toggleElementVisibility('SpinnerBinaryClassification', false);
}

// Função para atualizar o gráfico de classificação binária
function updateBinaryClassification(className, probability) {
  // Definir rótulo e cor com base na classe
  const label = className === 0 ? "Normal" : "Abnormal";
  const color = className === 0 ? 'rgb(0, 175, 108)' : 'rgb(194, 36, 36)';

  // Limpar os dados do gráfico Binário
  clearBinaryData();

  // Mostrar o gráfico binário
  showGraph_cb();

  // Atualizar os dados do gráfico binário
  updateBynaryData(label, color, probability);
}

// Função para enviar os dados ao servidor PHP
async function classifyData(data) {
  try {
    const response = await fetch('http://localhost/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/classify_samples.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ecgData: data }) // Enviar os dados como JSON
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar os dados ao servidor.');
    }

    const result = await response.json();
    console.log('Dados enviados com sucesso:', result);

    // Atualizar a interface com os resultados
    updateBinaryClassification(result.binary_model.predict_class, result.binary_model.probabilities);
    initializeEightClassification(result.eight_class_model.probabilities);
  } catch (error) {
    alert('Erro ao enviar os dados:', error);
  }
}
