<?php
header('Content-Type: application/json');

// Configurações do banco de dados
$host = "localhost";
$username = "root"; // Altere conforme necessário
$password = "";     // Altere conforme necessário
$database = "arritmias";

try {
    // Conexão com o banco de dados
    $conn = new mysqli($host, $username, $password, $database);

    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
} catch (Exception $e) {
    die(json_encode(["error" => "Erro ao conectar com o banco de dados: " . $e->getMessage()]));
}

// Verifica se o ID do paciente foi enviado
if (!isset($_GET['patient_id'])) {
    echo json_encode(["error" => "Parâmetro patient_id é obrigatório."]);
    exit;
}

$patient_id = intval($_GET['patient_id']); // Sanitiza o input para evitar SQL injection

// Consulta para buscar os dados de ECG com base no ID do paciente
$sql = "SELECT time, value FROM ecg WHERE id_patient = ?";

try {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Erro ao preparar a consulta: " . $conn->error);
    }

    // Vincula o parâmetro `id_patient` na consulta
    $stmt->bind_param("i", $patient_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $ecg_data = [];

    while ($row = $result->fetch_assoc()) {
        $ecg_data[] = [
            "time" => $row['time'],
            "value" => $row['value'],
        ];
    }

    // Retorna os dados em formato JSON
    if (empty($ecg_data)) {
        echo json_encode(["message" => "Nenhum dado encontrado para o paciente informado."]);
    } else {
        echo json_encode($ecg_data);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["error" => "Erro ao buscar os dados de ECG: " . $e->getMessage()]);
}

$conn->close();
?>
