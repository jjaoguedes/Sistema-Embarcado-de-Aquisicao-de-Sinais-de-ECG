// Funções relacionadas ao gráfico e plotagem do ECG

function updateECG_Data(values, time) {

    displayedData = values;
    ecgChart.data.labels = time; // Atualiza o eixo X com os tempos específicos para o intervalo
    ecgChart.data.datasets[0].data = values; // Atualiza o eixo Y com os valores do ECG
    ecgChart.update();
}

// Função auxiliar para limpar dados do ECG
function clearECGData() {
    displayedData = [];
    ecgChart.data.labels = [];
    ecgChart.data.datasets[0].data = [];
    ecgChart.update();
}

// Função auxiliar para limpar a lista de intervalos
function clearIntervalList() {
    const intervalList = document.getElementById('intervalList');
    intervalList.innerHTML = '';
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
function plotECGInterval(intervalData, samplingRate, intervalIndex, intervalSize) {
    // Calcular o tempo de início para o intervalo específico
    const startTime = intervalIndex * (intervalSize / samplingRate); // Cada intervalo começa após o anterior
    const time = intervalData.map((_, index) => (startTime + (index / samplingRate)).toFixed(2));    // Cada amostra tem um tempo específico

    const values = intervalData.map(point => point.value);

    // Limpa dados do ECG
    clearECGData();

    // Atualiza os dados no gráfico
    updateECG_Data(values, time);
}

// Função auxiliar para criar itens de lista
function createIntervalListItem(index, startIndex, endIndex, intervalSize, onClick) {
    const listItem = document.createElement('li');
    listItem.classList.add('interval-list-item'); // Classe CSS para estilo

    const indexText = document.createElement('span');
    indexText.textContent = `Interval ${index}: `;
    indexText.classList.add('interval-index'); // Classe CSS para estilo
    listItem.appendChild(indexText);

    const rangeText = document.createTextNode(`${startIndex} - ${endIndex} samples`);
    listItem.appendChild(rangeText);

    // Adiciona o evento de clique
    listItem.addEventListener('click', () => {
        // Habilita o botão apenas na primeira vez que for clicado
        if (!isButtonEnabled) {
            classifyButton.disabled = false; // Habilita o botão
            isButtonEnabled = true; // Marca que o botão já foi habilitado
            console.log("Botão de classificação habilitado!");
        }

        // Chama a função onClick com os parâmetros fornecidos
        onClick(index, intervalSize, true);
    });

    // Passa o índice e o tamanho do intervalo para a função de clique
    listItem.addEventListener('click', () => onClick(index, intervalSize, true));
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

        // Imprime o JSON completo
        console.log(ecgData);

        if (ecgData.length > 0) {
            const intervalSize = 1600; // Tamanho de cada intervalo
            const intervals = splitECGData(ecgData, intervalSize);

            const intervalList = document.getElementById('intervalList');
            clearIntervalList();
            //initializeClassList();

            intervals.forEach((interval, index) => {
                const startIndex = index * intervalSize; // Índice inicial do intervalo
                const endIndex = Math.min(startIndex + intervalSize - 1, ecgData.length - 1);

                // Passa o índice e o tamanho do intervalo para plotECGInterval
                const listItem = createIntervalListItem(
                    index,
                    startIndex,
                    endIndex,
                    intervalSize,
                    (intervalIndex, size) => plotECGInterval(interval, samplingRate, intervalIndex, size)
                );
                intervalList.appendChild(listItem);
            });

            console.log("Dados divididos e lista gerada.");
        } else {
            console.log("Nenhum dado de ECG encontrado para este paciente.");
        }
    } catch (error) {
        alert("Erro ao buscar dados de ECG:", error);
    } finally {
        document.getElementById('spinner').classList.add('d-none'); // Esconde o spinner
    }
}
/*
// Função para buscar e plotar os dados do ECG
async function fetchAndPlotECGFiltered(patientId, startDate, endDate) {
    try {
        const response = await fetch('http://localhost/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/get_ecg_filtered.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient_id: patientId, start_date: startDate, end_date: endDate})
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor.');
        }

        const ecgData = await response.json();

        // Imprime o JSON completo
        //console.log(ecgData);

        if (ecgData.length > 0) {
            const intervalSize = 1600; // Tamanho de cada intervalo
            const intervals = splitECGData(ecgData, intervalSize);

            const intervalList = document.getElementById('intervalList');
            clearIntervalList();
            //initializeClassList();

            intervals.forEach((interval, index) => {
                const startIndex = index * intervalSize; // Índice inicial do intervalo
                const endIndex = Math.min(startIndex + intervalSize - 1, ecgData.length - 1);

                // Passa o índice e o tamanho do intervalo para plotECGInterval
                const listItem = createIntervalListItem(
                    index,
                    startIndex,
                    endIndex,
                    intervalSize,
                    (intervalIndex, size) => plotECGInterval(interval, samplingRate, intervalIndex, size)
                );
                intervalList.appendChild(listItem);
            });

            console.log("Dados divididos e lista gerada.");
        } else {
            console.log("Nenhum dado de ECG encontrado para este paciente.");
        }
    } catch (error) {
        alert("Erro ao buscar dados de ECG:", error);
    } finally {
        document.getElementById('spinner').classList.add('d-none'); // Esconde o spinner
    }
}*/
