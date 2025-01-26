<?php
$json = file_get_contents('php://input');

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

$data = json_decode($json, true);

if ($data === null) {
    http_response_code(400); 
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$patient_id = $data['patient_id'];
$measurements = $data['measurements'];

if (empty($measurements) || !isset($measurements['value']) || !isset($measurements['datetime'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid measurements provided"]);
    exit;
}

$values = $measurements['value'];
$datetimes = $measurements['datetime'];

if (count($values) !== count($datetimes)) {
    http_response_code(400);
    echo json_encode(["error" => "Mismatched values and datetimes arrays"]);
    exit;
}

$conn->begin_transaction();
$stmt = NULL;

try {
    $stmt = $conn->prepare("INSERT INTO ecg (id_patient, datetime, value) VALUES (?, ?, ?)");
    
    if($stmt === false) {
        throw new Exception("Erro na preparação da query: " . $conn->error); 
    }

    $stmt->bind_param("isd", $patient_id, $datetime, $value); 

    for ($i = 0; $i < count($values); $i++) {
        $datetime = $datetimes[$i];
        $value = $values[$i];
        if (!$stmt->execute()) {
            throw new Exception("Erro ao executar a query: " . $stmt->error); 
        } 
    }
    
    $conn->commit();
    http_response_code(200);
    echo json_encode(["message" => "Data inserted successfully"]); 
}
catch(Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => "Error: " . $e->getMessage()]); 
}
finally {
    if ($stmt !== null) {
        $stmt->close();
    }
    $conn->close(); 
}
?>
