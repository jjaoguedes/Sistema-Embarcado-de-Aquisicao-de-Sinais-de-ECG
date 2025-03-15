let interval;

function normalizeData(data) {
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);

    if (minVal === maxVal) {
        // Evita divisão por zero
        return data.map(() => 0.5);
    }

    return data.map(val => (val - minVal) / (maxVal - minVal));
}

// Reamostra o sinal
function resampleSignal(data, originalFs, targetFs) {
    const ratio = targetFs / originalFs;
    const resampledLength = Math.round(data.length * ratio);
    const resampledSignal = new Array(resampledLength);

    for (let i = 0; i < resampledLength; i++) {
        const originalIndex = i / ratio;
        const indexLow = Math.floor(originalIndex);
        const indexHigh = Math.ceil(originalIndex);
        const weight = originalIndex - indexLow;

        if (indexHigh < data.length && indexLow >= 0) {
            resampledSignal[i] =
                data[indexLow] * (1 - weight) + data[indexHigh] * weight;
        } else {
            resampledSignal[i] = 0;
        }
        
    }

    return resampledSignal;
}

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

let selectedIntervalIndex = null; // Armazena o índice do intervalo selecionado


// Função auxiliar para criar itens de lista
function createIntervalListItem(index, startIndex, endIndex, intervalSize, onClick) {
    // Armazena o índice do intervalo selecionado
    selectedIntervalIndex = index;
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

// Função para enviar ECG reamostrado para o servidor
// Função para enviar ECG reamostrado para o servidor
async function sendResampledECG(resampledEcg) {
    try {
        const response = await fetch(`http://${host}/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/save_ecg.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ecgValues: resampledEcg })
        });

        const result = await response.json();
        
        if (result.success) {
            alert(`Sucesso: ${result.message}\nAmostras recebidas: ${resampledEcg.length}\nAmostras processadas: ${result.processedData.length}`);
        } else {
            alert(`Erro: ${result.message}`);
        }
        
        return result.processedData; // Retorna os dados processados diretamente
    } catch (error) {
        alert("Erro ao enviar dados:", error);
        return [];
    }
}


// Função para buscar e plotar dados do ECG (bruto ou filtrado)
async function fetchAndPlotECG(patientId, showFiltered, type) {
    try {
        const response = await fetch(`http://${host}/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/get_ecg.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient_id: patientId, type_collect: type })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor.');
        }

        const ecgData = await response.json();

        // Imprime o JSON completo
        console.log("JSON bruto recebido:", ecgData);

        // Verifica se existem dados disponíveis
        if (ecgData.length === 0) {
            console.log("Nenhum dado de ECG encontrado para este paciente.");
            return;
        }

        let ecgValues = ecgData.map(item => item.value);

        // Processamento adicional se for solicitado sinal filtrado
        if ((showFiltered == true) && type == "SMARTWATCH") {
            console.log("Aplicando filtragem no sinal...");

            const originalFs = 500; // Taxa de amostragem original
            const targetFs = 360;  // Taxa de amostragem desejada

            const resampledEcg = normalizeData(resampleSignal(ecgValues, originalFs, targetFs));

            ecgValues = await sendResampledECG(resampledEcg);

        }else if((showFiltered == true) && type == "ESP32"){

            const ecgNorm = normalizeData(ecgValues);
            ecgValues = await sendResampledECG(ecgNorm);

        }else{
            console.log("Obtenção dos dados brutos!")
        }

        let ecgFinal = ecgValues.map((value, index) => ({
            value
        }));

        console.log(showFiltered ? "Sinal filtrado:" : "Sinal bruto:", ecgFinal);

        // Divisão dos dados em intervalos
        const intervalSize = 1600; // Tamanho de cada intervalo
        const intervals = splitECGData(ecgFinal, intervalSize);

        const intervalList = document.getElementById('intervalList');
        clearIntervalList();

        intervals.forEach((interval, index) => {
            const startIndex = index * intervalSize;
            const endIndex = Math.min(startIndex + intervalSize - 1, ecgFinal.length - 1);

            const listItem = createIntervalListItem(
                index,
                startIndex,
                endIndex,
                intervalSize,
                (intervalIndex, size) => plotECGInterval(interval, 360, intervalIndex, size) // Taxa de amostragem alvo
            );
            intervalList.appendChild(listItem);
        });

        console.log("Dados divididos e lista gerada.");
    } catch (error) {
        alert("Erro ao buscar dados de ECG:", error);
    } finally {
        document.getElementById('spinner').classList.add('d-none'); // Esconde o spinner
    }

    console.log(interval);
}
