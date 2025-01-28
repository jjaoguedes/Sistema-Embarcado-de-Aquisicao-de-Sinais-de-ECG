<?php
// Lê os dados JSON enviados
$json = file_get_contents('php://input');

// Configurações do banco de dados
$host = "localhost";
$username = "root";
$password = "";
$database = "arritmias";

// Valida o JSON recebido
$data = json_decode($json, true);
if ($data === null) {
    http_response_code(400);
    echo json_encode(["error" => "JSON inválido ou ausente"]);
    exit;
}

// Verifica campos obrigatórios
if (
    !isset($data['patient_id']) || !is_int($data['patient_id']) ||
    !isset($data['measurements']['value']) || !is_array($data['measurements']['value'])
) {
    http_response_code(400);
    echo json_encode(["error" => "Dados ausentes ou inválidos"]);
    exit;
}

$patient_id = $data['patient_id'];
$values = $data['measurements']['value'];

// Conecta ao banco de dados
try {
    $conn = new mysqli($host, $username, $password, $database);
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erro ao conectar ao banco de dados: " . $e->getMessage()]);
    exit;
}

// Inicia a transação
$conn->begin_transaction();
$insertedCount = 0;

try {
    // Prepara os valores para inserção em lote
    $valuesPlaceholders = [];
    $valuesData = [];
    foreach ($values as $value) {
        if (is_numeric($value)) {  // Verifica se o valor é numérico
            $valuesPlaceholders[] = "(?, ?)";
            $valuesData[] = $patient_id;
            $valuesData[] = $value;
        }
    }

    if (empty($valuesPlaceholders)) {
        throw new Exception("Nenhum dado válido para inserir");
    }

    // Monta a query de inserção em lote
    $query = "INSERT INTO ecg (id_patient, value) VALUES " . implode(", ", $valuesPlaceholders);
    $stmt = $conn->prepare($query);
    if ($stmt === false) {
        throw new Exception("Erro na preparação da query: " . $conn->error);
    }

    // Define os tipos de dados para bind
    $types = str_repeat("id", count($valuesData) / 2);
    $stmt->bind_param($types, ...$valuesData);

    // Executa a query
    if ($stmt->execute()) {
        $insertedCount = $stmt->affected_rows;
        $conn->commit();
        http_response_code(200);
        echo json_encode(["message" => "Pacote recebido com sucesso", "inserted_count" => $insertedCount]);
    } else {
        throw new Exception("Erro ao executar a query: " . $stmt->error);
    }
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Erro: " . $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
?>
