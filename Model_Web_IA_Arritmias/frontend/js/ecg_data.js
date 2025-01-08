// Atualizar o gráfico ao selecionar um paciente
function onPatientChange() {

    patientSelect = document.getElementById("patient-select");
    const selectedPatient = patientSelect.value;
    const spinner = document.getElementById('spinner');
    spinner.classList.add('d-none');

    if (selectedPatient) {
      console.log(
        `Paciente ID ${selectedPatient} selecionado. Gráfico limpo. Clique no botão para iniciar a plotagem.`
      );

      displayedData = []; // Limpa as 1600 amostras armazenadas
      ecgChart.data.labels = [];
      ecgChart.data.datasets[0].data = [];
      ecgChart.update();
      document.getElementById("class").innerText = ""; // Atualiza a classe
      document.getElementById("probability").innerText = "";
      const intervalList = document.getElementById('intervalList');
      intervalList.innerHTML = ''; // Limpa a lista anterior
      const listContainer = document.getElementById('eight-class-list');
      listContainer.innerHTML = '';
      initializeClassList()
    } else {
      console.log("Nenhum paciente selecionado.");
    }
  }

function splitECGData(ecgData, intervalSize) {
    const intervals = [];
    for (let i = 0; i < ecgData.length; i += intervalSize) {
        intervals.push(ecgData.slice(i, i + intervalSize));
    }
    return intervals;
}

function plotECGInterval(intervalData, samplingRate) {
    const time = intervalData.map((_, index) => index / samplingRate);
    const values = intervalData.map(point => point.value);
    displayedData = values;
    ecgChart.data.labels = time;
    ecgChart.data.datasets[0].data = values;

    ecgChart.update();
}

async function fetchAndPlotECG(patientId) {
    try {
        const response = await fetch('http://localhost/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/get_ecg.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patient_id: patientId })
        });
        const ecgData = await response.json();

        if (ecgData.length > 0) {
            const intervalSize = 1600;
            const intervals = splitECGData(ecgData, intervalSize);

            // Gera a lista de índices na interface
            const intervalList = document.getElementById('intervalList');
            intervalList.innerHTML = ''; // Limpa a lista anterior

            intervals.forEach((interval, index) => {
                // Calcula os limites do intervalo
                const startIndex = index * intervalSize;
                const endIndex = Math.min(startIndex + intervalSize - 1, ecgData.length - 1); // Garante que não exceda o tamanho total dos dados

                // Cria o item da lista
                const listItem = document.createElement('li');

                // Adiciona o índice acima do intervalo
                const indexText = document.createElement('span'); // Elemento para o índice
                indexText.textContent = `Index ${index}: `; // Exibe "Intervalo X:"
                indexText.style.fontWeight = 'bold'; // Opcional: deixa o texto em negrito
                listItem.appendChild(indexText); // Adiciona o índice ao item da lista

                // Adiciona os limites do intervalo no mesmo item
                const rangeText = document.createTextNode(`${startIndex} - ${endIndex}`); // Texto com os limites
                listItem.appendChild(rangeText); // Adiciona o texto ao item da lista

                // Adiciona evento de clique para plotar o intervalo correspondente
                listItem.addEventListener('click', () => plotECGInterval(interval, samplingRate));
                intervalList.appendChild(listItem);
            });

            // Esconde o spinner após preencher a lista
            spinner.classList.add('d-none');


            console.log("Dados divididos e lista gerada.");
        } else {
            console.log("Nenhum dado de ECG encontrado para este paciente.");
        }
    } catch (error) {
        console.error("Erro ao buscar dados de ECG:", error);
    }
}