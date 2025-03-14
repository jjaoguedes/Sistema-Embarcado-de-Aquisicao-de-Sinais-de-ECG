// Inicializar funcionalidades, carregar dados iniciais, adicionar event listeners globais

// Elementos do DOM
const fetchButton = document.getElementById('fetch-ecg-btn');
let totalexamsDiv = document.getElementById('total-exams-performed');
let classifyButton = document.getElementById('classifyButton');
let loadButton = document.getElementById('LoadButton');
let smartwatchButton = document.getElementById('smartwatchButton');
let esp32Button = document.getElementById('esp32Button');
let mitbihButton = document.getElementById('mitbihButton');

let type_collect = "";

// Variável para armazenar o valor do contador
let count = 0;

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

        // Limpa o contador de exams performed
        count = 0;
        totalexamsDiv.textContent = `${count}`; // Atualiza o texto do elemento

        // Limpa a lista anterior e mostra o spinner
        clearIntervalList();
        //toggleElementVisibility('spinner', true);

        // Limpa dados e elementos da interface
        clearECGData();
        type_collect = "";
        //fetchAndPlotECG(selectedPatient, false);
    } else {
        alert('Por favor, selecione um paciente primeiro.');

        // Ocultar spinner
        //toggleElementVisibility('spinner', false);
    }
}

function hideGraph_cb() {

    toggleElementVisibility('SpinnerBinaryClassification', true);
    toggleElementVisibility('DoughnutChart_cb', false);
}
function hideGraph_8c() {

    toggleElementVisibility('contaneir', false);
    toggleElementVisibility('SpinnerEightClassification', true);
}

// Função para ocultar o container
function hideContainer() {
    const container = document.querySelector('.container');
    container.classList.add('d-none'); // Adiciona a classe 'd-none' para ocultar
    toggleElementVisibility('SpinnerEightClassification', true);
}

// Função para mostrar o container
function showContainer() {
    const container = document.querySelector('.container');
    container.classList.remove('d-none'); // Remove a classe 'd-none' para mostrar
    toggleElementVisibility('SpinnerEightClassification', false);
}

// Evento para enviar dados para classificação
classifyButton.addEventListener('click', async () => {

    // Incrementa o contador de cliques
    count++;

    // Atualiza o valor no elemento do DOM
    totalexamsDiv.textContent = count;

    // Oculta os gráficos e mostrar os spinners
    hideGraph_cb();
    hideContainer();

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


// Seleciona o botão pelo ID
const filterButton = document.getElementById('filterButton');

// Adiciona o evento de clique ao botão
filterButton.addEventListener('click', function (event) {
    const patientSelect = document.getElementById("patient-select");
    const selectedPatient = patientSelect.value;

    // Desabilita o botão
    classifyButton.disabled = true;
    // Variável para controle após desabilitar o botão
    isButtonEnabled = false;
    console.log(`Botão de classificação desabilitado!`);

    if (selectedPatient) {
        console.log(`Paciente ID ${selectedPatient} selecionado. Gráfico limpo. Gerando Plotagem do Intervalo.`);

        // Limpa o contador de exams performed
        count = 0;
        totalexamsDiv.textContent = `${count}`; // Atualiza o texto do elemento

        // Limpa a lista anterior e mostra o spinner
        clearIntervalList();
        toggleElementVisibility('spinner', true);

        // Limpa dados e elementos da interface
        clearECGData();

        // Inicio da Plotagem
        fetchAndPlotECG(selectedPatient, true, type_collect);
        alert('Dados filtrados!');
    } else {
        alert('Por favor, selecione um paciente primeiro.');

        // Ocultar spinner
        toggleElementVisibility('spinner', false);
    }
});

// Adiciona o evento de clique ao botão
smartwatchButton.addEventListener('click', function (event) {
    const patientSelect = document.getElementById("patient-select");
    const selectedPatient = patientSelect.value;
    type_collect = "SMARTWATCH";

    // Desabilita o botão
    classifyButton.disabled = true;
    // Variável para controle após desabilitar o botão
    isButtonEnabled = false;
    console.log(`Botão de classificação desabilitado!`);

    if (selectedPatient) {
        console.log(`Paciente ID ${selectedPatient} selecionado. Gráfico limpo. Gerando Plotagem do Intervalo.`);

        // Limpa o contador de exams performed
        count = 0;
        totalexamsDiv.textContent = `${count}`; // Atualiza o texto do elemento

        // Limpa a lista anterior e mostra o spinner
        clearIntervalList();
        toggleElementVisibility('spinner', true);

        // Limpa dados e elementos da interface
        clearECGData();

        // Inicio da Plotagem
        fetchAndPlotECG(selectedPatient, false, type_collect);
    } else {
        alert('Por favor, selecione um paciente primeiro.');

        // Ocultar spinner
        toggleElementVisibility('spinner', false);
    }
});

// Adiciona o evento de clique ao botão
esp32Button.addEventListener('click', function (event) {
    const patientSelect = document.getElementById("patient-select");
    const selectedPatient = patientSelect.value;
    type_collect = "ESP32";

    // Desabilita o botão
    classifyButton.disabled = true;
    // Variável para controle após desabilitar o botão
    isButtonEnabled = false;
    console.log(`Botão de classificação desabilitado!`);

    if (selectedPatient) {
        console.log(`Paciente ID ${selectedPatient} selecionado. Gráfico limpo. Gerando Plotagem do Intervalo.`);

        // Limpa o contador de exams performed
        count = 0;
        totalexamsDiv.textContent = `${count}`; // Atualiza o texto do elemento

        // Limpa a lista anterior e mostra o spinner
        clearIntervalList();
        toggleElementVisibility('spinner', true);

        // Limpa dados e elementos da interface
        clearECGData();

        // Inicio da Plotagem
        fetchAndPlotECG(selectedPatient, false, type_collect );
    } else {
        alert('Por favor, selecione um paciente primeiro.');

        // Ocultar spinner
        toggleElementVisibility('spinner', false);
    }
});

// Adiciona o evento de clique ao botão
mitbihButton.addEventListener('click', function (event) {
    const patientSelect = document.getElementById("patient-select");
    const selectedPatient = patientSelect.value;
    type_collect = "MITBIH";
    // Desabilita o botão
    classifyButton.disabled = true;
    // Variável para controle após desabilitar o botão
    isButtonEnabled = false;
    console.log(`Botão de classificação desabilitado!`);

    if (selectedPatient) {
        console.log(`Paciente ID ${selectedPatient} selecionado. Gráfico limpo. Gerando Plotagem do Intervalo.`);

        // Limpa o contador de exams performed
        count = 0;
        totalexamsDiv.textContent = `${count}`; // Atualiza o texto do elemento

        // Limpa a lista anterior e mostra o spinner
        clearIntervalList();
        toggleElementVisibility('spinner', true);

        // Limpa dados e elementos da interface
        clearECGData();

        // Inicio da Plotagem
        fetchAndPlotECG(selectedPatient, false, type_collect);
    } else {
        alert('Por favor, selecione um paciente primeiro.');

        // Ocultar spinner
        toggleElementVisibility('spinner', false);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const intervalList = document.getElementById("intervalList");

    intervalList.addEventListener("click", (event) => {
        // Verifica se o clique foi em um <li>
        if (event.target.tagName === "LI") {
            // Remove a classe 'active' de todos os itens
            Array.from(intervalList.children).forEach((item) =>
                item.classList.remove("active")
            );

            // Adiciona a classe 'active' ao item clicado
            event.target.classList.add("active");
        }
    });
});



// Remover o foco Antes de Fechar o Modal
const modal = document.getElementById("intervalListModal");
const triggerButton = document.querySelector("[data-bs-target='#intervalListModal']");

modal.addEventListener("hidden.bs.modal", () => {
    // Retorna o foco ao botão que abriu o modal
    triggerButton.focus();
});

// O aria-hidden só é aplicado quando o modal está completamente oculto
modal.addEventListener("show.bs.modal", () => {
    modal.setAttribute("aria-hidden", "undefined");
});

modal.addEventListener("hidden.bs.modal", () => {
    modal.setAttribute("aria-hidden", "defined");
});

document.addEventListener("DOMContentLoaded", function() {
    // Seleciona o botão pelo ID
    const button = document.getElementById("sidebarToggle");
    
    // Simula o clique no botão
    button.click();
  });  
// Inicialização ao carregar a página
window.onload = () => {
    loadPatients(); // Função definida em patient_data.js
    
};