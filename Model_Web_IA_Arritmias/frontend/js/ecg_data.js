// Funções relacionadas ao gráfico e plotagem do ECG

// Atualizar o gráfico ao selecionar um paciente
function onPatientChange() {
    const patientSelect = document.getElementById("patient-select");
    const selectedPatient = patientSelect.value;
    const spinner = document.getElementById('spinner');
    spinner.classList.add('d-none');

    if (selectedPatient) {
        console.log(`Paciente ID ${selectedPatient} selecionado. Gráfico limpo. Clique no botão para iniciar a plotagem.`);

        // Limpa dados e elementos da interface
        clearECGData();
        clearClassification();
        clearIntervalList();
        initializeClassList();
    } else {
        console.log("Nenhum paciente selecionado.");
    }
}

// Função auxiliar para limpar dados do ECG
function clearECGData() {
    displayedData = [];
    ecgChart.data.labels = [];
    ecgChart.data.datasets[0].data = [];
    ecgChart.update();
}

// Função auxiliar para limpar classificações exibidas
function clearClassification() {
    document.getElementById("class").innerText = "";
    document.getElementById("probability").innerText = "";
}

// Função auxiliar para limpar a lista de intervalos
function clearIntervalList() {
    const intervalList = document.getElementById('intervalList');
    intervalList.innerHTML = '';
    const listContainer = document.getElementById('eight-class-list');
    listContainer.innerHTML = '';
}

// Função para dividir os dados do ECG em intervalos
function splitECGData(ecgData, intervalSize) {
    const intervals = [];
    for (let i = 0; i < ecgData.length; i += intervalSize) {
        intervals.push(ecgData.slice(i, i + intervalSize));
    }
    return intervals;
}

// Função para plotar um intervalo de ECG
function plotECGInterval(intervalData, samplingRate) {
    const time = intervalData.map((_, index) => index / samplingRate);
    const values = intervalData.map(point => point.value);

    displayedData = values;
    ecgChart.data.labels = time;
    ecgChart.data.datasets[0].data = values;
    ecgChart.update();
}

// Função auxiliar para criar itens de lista
function createIntervalListItem(index, startIndex, endIndex, onClick) {
    const listItem = document.createElement('li');
    listItem.classList.add('interval-list-item'); // Classe CSS para estilo

    const indexText = document.createElement('span');
    indexText.textContent = `Index ${index}: `;
    indexText.classList.add('interval-index'); // Classe CSS para estilo
    listItem.appendChild(indexText);

    const rangeText = document.createTextNode(`${startIndex} - ${endIndex}`);
    listItem.appendChild(rangeText);

    listItem.addEventListener('click', onClick);
    return listItem;
}

// Função para buscar e plotar os dados do ECG
async function fetchAndPlotECG(patientId) {
    try {
        const response = await fetch('http://localhost/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/get_ecg.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient_id: patientId })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor.');
        }

        const ecgData = await response.json();

        if (ecgData.length > 0) {
            const intervalSize = 1600;
            const intervals = splitECGData(ecgData, intervalSize);

            const intervalList = document.getElementById('intervalList');
            clearIntervalList();
            initializeClassList();

            intervals.forEach((interval, index) => {
                const startIndex = index * intervalSize;
                const endIndex = Math.min(startIndex + intervalSize - 1, ecgData.length - 1);

                const listItem = createIntervalListItem(index, startIndex, endIndex, () => plotECGInterval(interval, samplingRate));
                intervalList.appendChild(listItem);
            });

            console.log("Dados divididos e lista gerada.");
        } else {
            console.log("Nenhum dado de ECG encontrado para este paciente.");
        }
    } catch (error) {
        console.error("Erro ao buscar dados de ECG:", error);
    } finally {
        document.getElementById('spinner').classList.add('d-none'); // Esconde o spinner
    }
}