<?php
header('Content-Type: application/json');

// Receber e decodificar o corpo da requisição
$data = json_decode(file_get_contents('php://input'), true);
$patient_id = isset($data['patient_id']) ? intval($data['patient_id']) : 0;
$type_collect = isset($data['type_collect']) ? $data['type_collect'] : '';

// Verificar se o patient_id é válido
if ($patient_id <= 0) {
    echo json_encode(["error" => "ID do paciente inválido."]);
    exit;
}

// Verificar se o type_collect foi informado
if (empty($type_collect)) {
    echo json_encode(["error" => "Tipo de coleta não informado."]);
    exit;
}

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

// Consulta para buscar os dados de ECG com base no ID do paciente e no tipo de coleta
$sql = "SELECT value FROM ecg WHERE id_patient = ? AND type_collect = ?";

try {
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Erro ao preparar a consulta: " . $conn->error);
    }

    // Vincula os parâmetros `id_patient` e `type_collect` na consulta
    $stmt->bind_param("is", $patient_id, $type_collect);
    $stmt->execute();

    $result = $stmt->get_result();
    $ecg_data = [];

    while ($row = $result->fetch_assoc()) {
        $ecg_data[] = [
            "value" => $row['value'],
        ];
    }

    // Retorna os dados em formato JSON
    if (empty($ecg_data)) {
        echo json_encode(["message" => "Nenhum dado encontrado para o paciente e tipo de coleta informados."]);
    } else {
        echo json_encode($ecg_data);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["error" => "Erro ao buscar os dados de ECG: " . $e->getMessage()]);
}

$conn->close();
?>