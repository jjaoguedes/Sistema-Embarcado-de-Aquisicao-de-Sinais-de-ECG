// Funções relacionadas a classificação

// Função genérica para atualizar os dados de um gráfico de rosca
function updateChartData(chart, probabilities) {

    chart.data.datasets[0].data = [];
    chart.options.plugins.doughnutCenterText.text = ``; // Atualiza o texto

    chart.options.plugins.doughnutCenterText.text = `${probabilities}%`; // Atualiza o texto
    chart.data.datasets[0].data = [probabilities, 100 - probabilities];
    chart.update();
}

// Função para mostrar e atualizar um gráfico de 8 classes
function showGraph(chartId, spinnerId, probabilities) {
    toggleElementVisibility(chartId, true); // Mostra o gráfico
    toggleElementVisibility(spinnerId, false); // Oculta o spinner
    const chart = Chart.getChart(chartId);
    if (chart) {
        updateChartData(chart, probabilities);
    }
}

// Função para inicializar múltiplos gráficos
function initializeEightClassification(probabilities) {

    showContainer();

    showGraph('DoughnutChart_8c_0', 'SpinnerEightClassification', probabilities[0]);
    showGraph('DoughnutChart_8c_1', 'SpinnerEightClassification', probabilities[1]);
    showGraph('DoughnutChart_8c_2', 'SpinnerEightClassification', probabilities[2]);
    showGraph('DoughnutChart_8c_3', 'SpinnerEightClassification', probabilities[3]);
    showGraph('DoughnutChart_8c_4', 'SpinnerEightClassification', probabilities[4]);
    showGraph('DoughnutChart_8c_5', 'SpinnerEightClassification', probabilities[5]);
    showGraph('DoughnutChart_8c_6', 'SpinnerEightClassification', probabilities[6]);
    showGraph('DoughnutChart_8c_7', 'SpinnerEightClassification', probabilities[7]);
}

function updateBynaryData(label, color, probability) {

  // Atualizando os dados do gráfico binário
  myDoughnutChart.data.labels = [label]; // Apenas o rótulo da classe escolhida
  myDoughnutChart.data.datasets[0].data = [probability, 100 - probability]; // Apenas a probabilidade da classe
  myDoughnutChart.options.plugins.doughnutCenterText.text = `${probability}%`;
  myDoughnutChart.data.datasets[0].backgroundColor = [color, '#C0C0C0']; // Cor correspondente

  // Atualizando o gráfico binário
  myDoughnutChart.update();
}

function clearBinaryData() {

  myDoughnutChart.options.plugins.doughnutCenterText.text = '';
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
    const response = await fetch(`http://${host}/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/classify_samples.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ecgData: data}) // Enviar os dados como JSON
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
