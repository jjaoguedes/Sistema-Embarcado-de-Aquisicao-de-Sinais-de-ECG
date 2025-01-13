// Inicializar funcionalidades, carregar dados iniciais, adicionar event listeners globais

// Elementos do DOM
const fetchButton = document.getElementById('fetch-ecg-btn');
let classifyButton = document.getElementById('classifyButton');

// Função para exibir ou ocultar elementos
function toggleElementVisibility(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('d-none', !show);
    }
}

// Variável para controlar se o botão já foi habilitado
let isButtonEnabled = false;

// Atualizar o gráfico ao selecionar um paciente e desa
function onPatientChange() {
    const patientSelect = document.getElementById("patient-select");
    const selectedPatient = patientSelect.value;

    // Desabilita o botão
    classifyButton.disabled = true;
    // Variável para controle após desabilitar o botão
    isButtonEnabled = false;
    console.log(`Botão de classificação desabilitado!`);

    if (selectedPatient) {
        console.log(`Paciente ID ${selectedPatient} selecionado. Gráfico limpo. Gerando Plotagem do Intervalo.`);

        // Limpa a lista anterior e mostra o spinner
        clearIntervalList();
        toggleElementVisibility('spinner', true);

        // Limpa dados e elementos da interface
        clearECGData();

        // Inicio da Plotagem
        fetchAndPlotECG(selectedPatient);
    } else {
        alert('Por favor, selecione um paciente primeiro.');
        
        // Ocultar spinner
        toggleElementVisibility('spinner', false);
    }
}

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

    // Oculta os gráficos e mostrar os spinners
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
        alert("Nenhum dado disponível para classificação. Por favor, selecione um paciente primeiro.");
    }
});

// Inicialização ao carregar a página
window.onload = () => {
    loadPatients(); // Função definida em patient_data.js
};