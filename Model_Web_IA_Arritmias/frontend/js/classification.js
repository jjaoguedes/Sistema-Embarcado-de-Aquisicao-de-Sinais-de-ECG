// Funções relacionadas a classificação

function updateEightData(probabilities) {

  // Atualizar os dados do gráfico de 8 classes
  myDoughnutChart_8c.data.datasets[0].data = []; // Limpa os dados
  myDoughnutChart_8c.data.datasets[0].data = probabilities;
  myDoughnutChart_8c.update(); // Atualizando o gráfico de 8 classes
}

function showGraph_8c() {

  toggleElementVisibility('DoughnutChart_8c', true);
  toggleElementVisibility('SpinnerEightClassification', false);
}

// Função para atualizar o gráfico e a lista com as probabilidades de classificação
function updateEightClassification(probabilities) {

  // Mostrar gráfico de 8 classes
  showGraph_8c();

  // Atualizar os dados do gráfico de 8 classes
  updateEightData(probabilities);
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
  const color = className === 0 ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)';

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
    updateEightClassification(result.eight_class_model.probabilities);
  } catch (error) {
    alert('Erro ao enviar os dados:', error);
  }
}
