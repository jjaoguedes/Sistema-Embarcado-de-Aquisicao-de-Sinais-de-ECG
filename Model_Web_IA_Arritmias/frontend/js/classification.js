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

// Inicializa a lista de classes
function initializeClassList() {
    const listContainer = document.getElementById('eight-class-list');
    classNames.forEach((className) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${className}: </strong>`;
        listItem.style.marginBottom = "5px";
        listContainer.appendChild(listItem);
    });
}

// Função para atualizar a div com os dados de classificação
function updateEightClass(probabilities) {
    const listContainer = document.getElementById('eight-class-list');
    listContainer.classList.remove("d-none"); // Exibe o container da lista de 8 classes
    listContainer.innerHTML = ''; // Limpa o conteúdo anterior
    const spinner_8c = document.getElementById('SpinnerEightClassification');
    spinner_8c.classList.add('d-none');

    probabilities.forEach((probability, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${classNames[index]}:</strong> ${probability.toFixed(2)}%`;
        listItem.style.marginBottom = "5px";
        listContainer.appendChild(listItem);
    });
}

// Função para atualizar a classificação e probabilidade na div
function updateClassification(className, probability) {

    const spinner = document.getElementById('SpinnerBinaryClassification');

    if (className == 0) {
        document.getElementById("class-container").classList.remove("d-none"); // Exibe o container da classe
        document.getElementById("probability-container").classList.remove("d-none"); // Exibe o container da probabilidade
        spinner.classList.add('d-none');
        document.getElementById("class").innerText = "Normal"; // Atualiza a classe
        document.getElementById("probability").innerText = probability.toFixed(2) + '%'; // Atualiza a probabilidade
    } else {
        document.getElementById("class-container").classList.remove("d-none"); // Exibe o container da classe
        document.getElementById("probability-container").classList.remove("d-none"); // Exibe o container da probabilidade
        spinner.classList.add('d-none');
        document.getElementById("class").innerText = "Abnormal"; // Atualiza a classe
        document.getElementById("probability").innerText = probability.toFixed(2) + '%'; // Atualiza a probabilidade
    }

}

// Função para enviar os dados ao servidor PHP
async function classifyData(data) {
    try {
        const response = await fetch('http://localhost/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/classify_samples.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ecgData: data }) // Enviar os dados como JSON
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar os dados ao servidor.');
        }

        const result = await response.json();
        console.log('Dados enviados com sucesso:', result);
        // Atualizar a div com os dados retornados do servidor
        updateClassification(result.binary_model.predict_class, result.binary_model.probabilities);
        updateEightClass(result.eight_class_model.probabilities);

    } catch (error) {
        console.error('Erro ao enviar os dados:', error);
    }
}