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
    clearIntervalList();
    toggleElementVisibility('spinner', true);

    if (patientId) {
        console.log(`Iniciando plotagem para o paciente ID ${patientId}`);

        // Reinicia o gráfico e busca os dados
        clearECGData();

        await fetchAndPlotECG(patientId);
    } else {
        alert('Por favor, selecione um paciente primeiro.');
        toggleElementVisibility('spinner', false);
    }
});

function hideGraph_cb(){

    toggleElementVisibility('SpinnerBinaryClassification', true);
    toggleElementVisibility('DoughnutChart_cb', false);
}
function hideGraph_8c(){

    toggleElementVisibility('DoughnutChart_8c', false);
    toggleElementVisibility('SpinnerEightClassification', true);
}
// Evento para enviar dados para classificação
classifyButton.addEventListener('click', async () => {

    // Ocultar os gráficos e mostrar os spinners
    hideGraph_cb();
    hideGraph_8c();

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
};