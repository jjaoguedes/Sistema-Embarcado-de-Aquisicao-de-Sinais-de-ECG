// Inicializar funcionalidades, carregar dados iniciais, adicionar event listeners globais

// Elementos do DOM
const fetchButton = document.getElementById('fetch-ecg-btn');
const classifyButton = document.getElementById('classifyButton');

// Função para exibir ou ocultar elementos
function toggleElementVisibility(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('d-none', !show);
    }
}

// Evento para carregar os dados do paciente
fetchButton.addEventListener('click', async () => {
    const patientSelect = document.getElementById('patient-select');
    const patientId = patientSelect?.value;

    // Limpa a lista anterior e mostra o spinner
    const intervalList = document.getElementById('intervalList');
    intervalList.innerHTML = '';
    toggleElementVisibility('spinner', true);

    if (patientId) {
        console.log(`Iniciando plotagem para o paciente ID ${patientId}`);

        // Reinicia o gráfico e busca os dados
        shouldStop = false;
        ecgChart.data.labels = [];
        ecgChart.data.datasets[0].data = [];
        ecgChart.update();

        await fetchAndPlotECG(patientId);
    } else {
        alert('Por favor, selecione um paciente primeiro.');
        toggleElementVisibility('spinner', false);
    }
});

// Evento para enviar dados para classificação
classifyButton.addEventListener('click', async () => {
    // Esconde os contêineres e exibe os spinners
    toggleElementVisibility('class-container', false);
    toggleElementVisibility('probability-container', false);
    toggleElementVisibility('eight-class-list', false);
    toggleElementVisibility('SpinnerBinaryClassification', true);
    toggleElementVisibility('SpinnerEightClassification', true);

    if (displayedData?.length > 0) {
        console.log("Enviando dados para classificação...");

        try {
            const response = await classifyData(displayedData);
            console.log("Classificação concluída:", response);
        } catch (error) {
            console.error("Erro ao classificar dados:", error);
        }
    } else {
        console.log("Nenhum dado disponível para classificação.");
    }
});

// Inicialização ao carregar a página
window.onload = () => {
    loadPatients(); // Função definida em patient_data.js
    //initializeClassList(); // Função definida em classification.js
};