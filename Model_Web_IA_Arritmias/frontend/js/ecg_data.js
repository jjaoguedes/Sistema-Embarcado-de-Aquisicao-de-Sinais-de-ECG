// Funções relacionadas ao gráfico e plotagem do ECG
// Normaliza os dados entre 0 e 1

let interval;

function normalizeData(data) {
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);

    if (minVal === maxVal) {
        // Evita divisão por zero
        return data.map(() => 0.5); // Retorna um valor neutro arbitrário
    }

    return data.map(val => (val - minVal) / (maxVal - minVal));
}

// Reamostra o sinal
function resampleSignal(data, originalFs, targetFs) {
    const ratio = targetFs / originalFs; // Razão entre as frequências
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
            resampledSignal[i] = 0; // Substitui valores fora do intervalo por 0
        }
        
    }

    return resampledSignal;
}

const DSP = require('dsp.js'); // Certifique-se de instalar a biblioteca DSP.js

function bandpassFilter(data, lowcut, highcut, fs) {
    const nyquist = 0.5 * fs;
    const low = lowcut / nyquist;
    const high = highcut / nyquist;

    const filter = new DSP.BandpassFilter(low, high);
    const filteredSignal = new Array(data.length);

    for (let i = 0; i < data.length; i++) {
        filteredSignal[i] = filter.singleStep(data[i]);
    }

    return filteredSignal;
}


// Função para calcular o filtro mediano
function medfilt(signal, kernelSize) {
    const halfKernel = Math.floor(kernelSize / 2);
    const filteredSignal = new Array(signal.length);

    for (let i = 0; i < signal.length; i++) {
        const start = Math.max(0, i - halfKernel);
        const end = Math.min(signal.length, i + halfKernel + 1);
        const window = signal.slice(start, end);
        window.sort((a, b) => a - b);
        filteredSignal[i] = window[Math.floor(window.length / 2)];
    }

    return filteredSignal;
}

// Filtro FIR
function firFilter(data, coefficients) {
    const filteredSignal = [];
    const coeffLength = coefficients.length;

    for (let i = 0; i < data.length; i++) {
        let acc = 0; // Acumulador para a soma ponderada
        for (let j = 0; j < coeffLength; j++) {
            if (i - j >= 0) {
                acc += data[i - j] * coefficients[j];
            }
        }
        filteredSignal.push(acc);
    }

    return filteredSignal;
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


// Função para buscar e plotar dados do ECG (bruto ou filtrado)
async function fetchAndPlotECG(patientId, showFiltered, type) {
    try {
        const response = await fetch('http://10.224.1.28/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/get_ecg.php', {
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
            
            const ecgNorm = normalizeData(ecgValues);

            const originalFs = 500; // Taxa de amostragem original
            const targetFs = 360;  // Taxa de amostragem desejada
            const resampledEcg = resampleSignal(ecgNorm, originalFs, targetFs);

            //Median Filter Start
            const kernel_size = 61;
            const median_filter = medfilt(resampledEcg, kernel_size);
            const signal_correction = resampledEcg.map((value, index) => value - median_filter[index]);
            //Median Filter End

            const lowcut = 0.3; // Frequência de corte inferior
            const highcut = 50; // Frequência de corte superior
            const filteredSignal = bandpassFilter(signal_correction, lowcut, highcut, targetFs);

            //const FIR_COEFFICIENTS = [0.0001, 0.0005, 0.0020, 0.0050, 0.00, 0.0200, 0.0300, 0.0400, 0.0300, 0.0200, 0.00, 0.0050, 0.0001];
            //const ecgFIR = firFilter(filteredSignal, FIR_COEFFICIENTS);

            ecgValues = normalizeData(filteredSignal); // Atualiza os valores para o sinal FIR filtrado

        }else if((showFiltered == true) && type == "ESP32"){

            const targetFs = 360;  // Taxa de amostragem desejada

            //Median Filter Start
            const kernel_size = 61;
            const median_filter = medfilt(ecgValues, kernel_size);
            const signal_correction = ecgValues.map((value, index) => value - median_filter[index]);
            //Median Filter End

            const lowcut = 0.3; // Frequência de corte inferior
            const highcut = 50; // Frequência de corte superior
            const filteredSignal = bandpassFilter(signal_correction, lowcut, highcut, targetFs);

            ecgValues = normalizeData(filteredSignal); // Atualiza os valores para o sinal FIR filtrado

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
