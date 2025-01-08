const fetchButton = document.getElementById('fetch-ecg-btn');

// Adiciona evento ao botão Load Data
fetchButton.addEventListener('click', () => {
    patientSelect = document.getElementById('patient-select');
    const patientId = patientSelect.value;
    intervalList.innerHTML = ''; // Limpa a lista anterior
    // Mostrar o spinner
    const spinner = document.getElementById('spinner');
    spinner.classList.remove('d-none');
    if (patientId) {
        console.log(`Iniciando plotagem para o paciente ID ${patientId}`);
        shouldStop = false; // Interrompe a execução atual
        ecgChart.data.labels = [];
        ecgChart.data.datasets[0].data = [];
        ecgChart.update();
        fetchAndPlotECG(patientId);
    } else {
        alert('Por favor, selecione um paciente primeiro.');
    }
});

document.getElementById("classifyButton").addEventListener("click", () => {

    // Mostrar o spinner
    const spinner_cb = document.getElementById('SpinnerBinaryClassification');
    // Esconde os elementos de classe e probabilidade
    document.getElementById("class-container").classList.add("d-none"); // Oculta o container da classe
    document.getElementById("probability-container").classList.add("d-none"); // Oculta o container da probabilidade

    // Mostrar o spinner
    const spinner_8c = document.getElementById('SpinnerEightClassification');
    // Esconde os elementos de classe e probabilidade
    document.getElementById("eight-class-list").classList.add("d-none"); // Oculta o container da classe

    spinner_cb.classList.remove('d-none');
    spinner_8c.classList.remove('d-none');

    if (displayedData.length > 0) {
        console.log("Enviando dados para classificação...");
        // Enviar os dados ao servidor
        classifyData(displayedData)
            .then(response => {
                console.log("Classificação concluída:", response);

            })
            .catch(error => {
                console.error("Erro ao classificar dados:", error);

            });


    } else {
        console.log("Nenhum dado disponível para classificação.");
    }
});

window.onload = () => {
    loadPatients(); // Função em patient_data.js
    initializeClassList(); // Função em classification.js
    //setupEventListeners(); // Função em main.js
};