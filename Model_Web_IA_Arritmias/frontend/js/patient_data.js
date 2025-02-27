// Lidar com a lógica de carregamento de pacientes

// Selecionar o elemento do total de pacientes
let totalPatientsDiv = document.getElementById('total-patients');

// Função para carregar pacientes na lista de seleção
async function loadPatients() {
    patientSelect = document.getElementById('patient-select');

    try {
        const response = await fetch('http://10.224.1.28/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/get_patients.php'); // Endpoint correto
        if (!response.ok) {
            throw new Error('Erro ao carregar pacientes.');
        }

        const patients = await response.json();
        patientSelect.innerHTML = '<option value="">Select a patient</option>';

        if (patients.length > 0) {
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id_patient; // Define o ID do paciente como valor
                option.textContent = `${patient.name}`;
                patientSelect.appendChild(option);
            });

            // Atualizar o total de pacientes na div
            totalPatientsDiv.textContent = `${patients.length}`;

        } else {
            patientSelect.innerHTML = '<option value="">No patients found</option>';
            totalPatientsDiv.textContent = '0'; // Atualizar para 0 se não houver pacientes
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        patientSelect.innerHTML = '<option value="">Error loading patients</option>';
        totalPatientsDiv.textContent = '0'; // Atualizar para 0 em caso de erro
    }
}