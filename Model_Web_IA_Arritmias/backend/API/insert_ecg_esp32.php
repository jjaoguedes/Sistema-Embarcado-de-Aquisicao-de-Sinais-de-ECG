<?php
require_once 'config.php';

// Configurações do banco de dados
$username = "root";
$password = "";
$database = "arritmias";

// Configura mysqli para lançar exceções
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Lê os dados JSON enviados
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Valida o JSON recebido
if ($data === null || !isset($data['id_patient']) || !isset($data['start_datetime']) || !isset($data['values'])) {
    http_response_code(400);
    echo json_encode(["error" => "JSON inválido ou campos obrigatórios ausentes"]);
    exit;
}

// Mapeia os campos do ESP32 para os campos esperados
$data['patient_id'] = $data['id_patient']; // Renomeia id_patient para patient_id
$data['value'] = $data['values']; // Renomeia values para value

// Validação do patient_id
$patient_id = filter_var($data['patient_id'], FILTER_VALIDATE_INT);
if ($patient_id === false) {
    http_response_code(400);
    echo json_encode(["error" => "ID do paciente inválido"]);
    exit;
}

// Validação do start_datetime
$start_datetime = $data['start_datetime'];
if (strtotime($start_datetime) === false) {
    http_response_code(400);
    echo json_encode(["error" => "Data e hora de início inválidas"]);
    exit;
}

// Validação dos valores de medição
$values = array_filter($data['value'], function ($value) {
    return $value;
});

if (empty($values)) {
    http_response_code(400);
    echo json_encode(["error" => "Nenhum valor de medição fornecido ou valores fora do intervalo permitido [0, 2]"]);
    exit;
}

// Tipo de coleta (pode ser dinâmico se necessário)
$type_collect = $data['type_collect'] ?? "ESP32"; // Valor padrão "ESP32" se não fornecido

// Conecta ao banco de dados
try {
    $conn = new mysqli($host, $username, $password, $database);
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erro ao conectar ao banco de dados"]);
    error_log("Erro ao conectar ao banco: " . $e->getMessage());
    exit;
}

// Inicia transação
$conn->begin_transaction();
$insertedCount = 0;

try {
    // Tamanho do lote (ajustável conforme necessário)
    $batchSize = 100; // Inserir 100 registros por lote
    $batches = array_chunk($values, $batchSize);

    foreach ($batches as $batch) {
        // Prepara os dados para inserção
        $dataToBind = [];
        foreach ($batch as $value) {
            $dataToBind[] = $start_datetime;
            $dataToBind[] = $patient_id;
            $dataToBind[] = floatval($value);
            $dataToBind[] = $type_collect;
        }

        // Monta a query com placeholders dinâmicos
        $placeholders = implode(", ", array_fill(0, count($batch), "(?, ?, ?, ?)"));
        $query = "INSERT INTO ecg (start_datetime, id_patient, value, type_collect) VALUES " . $placeholders;

        // Prepara a query
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Erro ao preparar a query: " . $conn->error);
        }

        // Define os tipos dinamicamente (i para inteiro, d para float, s para string)
        $types = str_repeat("sids", count($batch));

        // Vincula os parâmetros
        $stmt->bind_param($types, ...$dataToBind);

        // Executa a query
        if ($stmt->execute()) {
            $insertedCount += $stmt->affected_rows;
        } else {
            throw new Exception("Erro ao executar a query: " . $stmt->error);
        }

        // Fecha o statement
        $stmt->close();
    }

    // Confirma transação se tudo estiver OK
    $conn->commit();
    http_response_code(200);
    echo json_encode([
        "message" => "Pacote recebido com sucesso",
        "inserted_count" => $insertedCount,
        "total_values" => count($values)
    ]);
} catch (Exception $e) {
    // Rollback em caso de erro
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Erro durante o processamento: " . $e->getMessage()]);
    error_log("Erro durante o processamento: " . $e->getMessage());
} finally {
    // Fecha a conexão com o banco de dados
    if (isset($conn)) {
        $conn->close();
    }
}
?>