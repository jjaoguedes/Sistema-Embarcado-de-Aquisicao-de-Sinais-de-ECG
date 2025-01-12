// Funções relacionadas a classificação

// Lista de nomes das classes
const classNames = [
    "Normal Beat",
    "Atrial Premature Contraction",
    "Ventricular Escape Beat",
    "Left Bundle Branch Block Beat",
    "Right Bundle Branch Block Beat",
    "Premature Ventricular",
    "Ventricular Flutter Wave",
    "Paced Beat"
];

// Função auxiliar para criar itens de lista
function createListItem(content) {
    const listItem = document.createElement('li');
    listItem.innerHTML = content;
    listItem.classList.add('list-item'); // Estilo definido via CSS
    return listItem;
}

// Inicializa a lista de classes
function initializeClassList() {
    const listContainer = document.getElementById('eight-class-list');
    classNames.forEach((className) => {
        const listItem = createListItem(`<strong>${className}: </strong>`);
        listContainer.appendChild(listItem);
    });
}

function updateChart(classification, probability) {
    // Define cores e rótulos para as classes
    const labels = ['Normal', 'Anormal'];
    const colors = {
      normal: {
        background: 'rgba(75, 192, 192, 0.2)', // Verde claro
        border: 'rgba(75, 192, 192, 1)'        // Verde escuro
      },
      abnormal: {
        background: 'rgba(255, 99, 132, 0.2)', // Vermelho claro
        border: 'rgba(255, 99, 132, 1)'        // Vermelho escuro
      }
    };
  
    // Seleciona cores com base na classificação
    const selectedColors = classification === 0 ? colors.normal : colors.abnormal;
  
    // Atualiza os dados do gráfico
    myDoughnutChart.data = {
      labels: labels, // Rótulos
      datasets: [{
        data: [probability * 100, (1 - probability) * 100], // Probabilidade em porcentagem
        backgroundColor: [
          selectedColors.background,
          'rgba(201, 203, 207, 0.2)' // Cinza claro para o restante
        ],
        borderColor: [
          selectedColors.border,
          'rgba(201, 203, 207, 1)' // Cinza escuro para o restante
        ],
        borderWidth: 1
      }]
    };
  
    // Atualiza o gráfico para refletir as mudanças
    myDoughnutChart.update();
  
    // Atualiza o texto de probabilidade
    document.getElementById('probability').textContent = `${(probability * 100).toFixed(2)}% (${classification === 0 ? 'Normal' : 'Anormal'})`;
  }

// Função para atualizar o gráfico e a lista com as probabilidades de classificação
function updateEightClass(probabilities) {
  const listContainer = document.getElementById('eight-class-list');
  const spinner = document.getElementById('SpinnerEightClassification');

  // Exibir a lista e ocultar o spinner
  listContainer.classList.remove('d-none');
  spinner.classList.add('d-none');

  // Limpar a lista existente
  listContainer.innerHTML = '';

  // Adicionar itens com as probabilidades na lista
  probabilities.forEach((probability, index) => {
      const content = `<strong>${classNames[index]}:</strong> ${probability.toFixed(2)}%`;
      const listItem = createListItem(content);
      listContainer.appendChild(listItem);
  });

  // Atualizar os dados do gráfico
  myDoughnutChart_8c.data.datasets[0].data = [];
  myDoughnutChart_8c.data.datasets[0].data = probabilities;
  myDoughnutChart_8c.update(); // Atualizar o gráfico para refletir os novos dados
}

// Função para atualizar o gráfico de classificação binária
function updateChart(className, probability) {
  // Definir rótulo e cor com base na classe
  const label = className === 0 ? "Normal" : "Abnormal";
  const color = className === 0 ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)';

 // Atualizando os dados do gráfico
 myDoughnutChart.data.labels = []; // Apenas o rótulo da classe escolhida
 myDoughnutChart.data.datasets[0].data = []; // Apenas a probabilidade da classe
 myDoughnutChart.data.datasets[0].backgroundColor = []; // Cor correspondente
 myDoughnutChart.data.datasets[0].borderColor = []; // Cor correspondente


  // Atualizando os dados do gráfico
  myDoughnutChart.data.labels = [label]; // Apenas o rótulo da classe escolhida
  myDoughnutChart.data.datasets[0].data = [probability]; // Apenas a probabilidade da classe
  myDoughnutChart.data.datasets[0].backgroundColor = [color]; // Cor correspondente
  myDoughnutChart.data.datasets[0].borderColor = [color]; // Cor correspondente


  // Atualizando o gráfico
  myDoughnutChart.update();
}

// Função auxiliar para exibir a classificação e probabilidade
function displayClassification(classText, probability) {
    const classContainer = document.getElementById('class-container');
    const probabilityContainer = document.getElementById('probability-container');
    const spinner = document.getElementById('SpinnerBinaryClassification');

    // Exibir os contêineres e atualizar o conteúdo
    classContainer.classList.remove('d-none');
    probabilityContainer.classList.remove('d-none');
    spinner.classList.add('d-none');

    document.getElementById('class').innerText = classText;
    document.getElementById('probability').innerText = `${probability.toFixed(2)}%`;
}

// Modificação da função updateBinaryClassification
function updateBinaryClassification(className, probability) {
  const classText = className === 0 ? "Normal" : "Abnormal";

  // Atualizar a exibição de classificação e probabilidade
  displayClassification(classText, probability);

  // Atualizar o gráfico
  updateChart(className, probability);
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
        updateEightClass(result.eight_class_model.probabilities);
        updateChart(result.binary_model.predict_class, result.binary_model.probabilities);
    } catch (error) {
        console.error('Erro ao enviar os dados:', error);
    }
}
