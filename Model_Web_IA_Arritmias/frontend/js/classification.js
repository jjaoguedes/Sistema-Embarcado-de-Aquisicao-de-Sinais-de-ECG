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

// Função para atualizar a div com os dados de classificação
function updateEightClass(probabilities) {
    const listContainer = document.getElementById('eight-class-list');
    const spinner = document.getElementById('SpinnerEightClassification');

    // Exibir a lista e ocultar o spinner
    listContainer.classList.remove('d-none');
    spinner.classList.add('d-none');

    // Limpar a lista existente
    listContainer.innerHTML = '';

    // Adicionar itens com as probabilidades
    probabilities.forEach((probability, index) => {
        const content = `<strong>${classNames[index]}:</strong> ${probability.toFixed(2)}%`;
        const listItem = createListItem(content);
        listContainer.appendChild(listItem);
    });
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

// Função para atualizar a classificação binária
function updateBinaryClassification(className, probability) {
    const classText = className === 0 ? "Normal" : "Abnormal";
    displayClassification(classText, probability);
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

    } catch (error) {
        console.error('Erro ao enviar os dados:', error);
    }
}
