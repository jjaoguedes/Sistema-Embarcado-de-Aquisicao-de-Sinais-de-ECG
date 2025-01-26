<?php
header('Content-Type: application/json');

// Receber e decodificar o corpo da requisição
$data = json_decode(file_get_contents('php://input'), true);
// Atribuir valores com os tipos corretos
$patient_id = isset($data['patient_id']) ? intval($data['patient_id']) : 0;
$date_inicial = isset($data['start_date']) ? $data['start_date'] : '';
$date_final = isset($data['end_date']) ? $data['end_date'] : '';


/*// Verificar se o patient_id e as datas são válidas
if ($patient_id <= 0) {
    echo json_encode(["error" => "ID do paciente inválido."]);
    exit;
}*/

/*
if (empty($date_inicial) || empty($date_final)) {
    echo json_encode(["error" => "Datas não fornecidas."]);
    exit;
}*/

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

// Consulta SQL para buscar os dados de ECG com base no ID do paciente e no intervalo de datas
$sql = "SELECT * FROM ecg WHERE id_patient = ? AND DATE(date) BETWEEN ? AND ?";

try {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Erro ao preparar a consulta: " . $conn->error);
    }

    // Vincula os parâmetros `id_patient`, `start_date` e `end_date` na consulta
    $stmt->bind_param("iss", $patient_id, $date_inicial, $date_final);
    $stmt->execute();

    $result = $stmt->get_result();
    $ecg_data = [];

    while ($row = $result->fetch_assoc()) {
        $ecg_data[] = [
            "value" => $row['value'],
        ];
    }

    // Retorna os dados em formato JSON
    echo json_encode($ecg_data);

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["error" => "Erro ao buscar os dados de ECG: " . $e->getMessage()]);
}

$conn->close();
?>
