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

$datetime = $data['datetime'];
$patient_id = $data['patient_id'];
$measurements = $data['measurements'];

if (empty($measurements)) {
    http_response_code(400);
    echo json_encode(["error" => "No measurements provided"]);
    exit;
}
/*
$sql = "START TRANSACTION;\n";

foreach ($measurements as $measurement) {
    $measurement_datetime = $measurement['datetime'];
    $measurement_value = $measurement['value'];


    $escaped_datetime = addslashes($measurement_datetime);
    $escaped_value = addslashes($measurement_value);

    $sql .= "INSERT INTO measurements (patient_id, datetime, value) VALUES ('$patient_id', '$escaped_datetime', '$escaped_value');\n";
}

$sql .= "COMMIT;";
*/
$conn->begin_transaction();
$stmt = NULL;

try {
    $stmt = $conn->prepare("INSERT INTO ecg (id_patient, datetime, value) VALUES (?, ?, ?)");
    
    if($stmt===false) {
        throw new Exception("Erro na preparação da query: ".$conn->error); 
    }

    $stmt->bind_param("iss", $patient_id, $datetime, $value); 

    foreach($measurements as $measurement) {
        $datetime=$measurement['datetime'];
        $value=$measurement['value'];
        if(!$stmt->execute()) {
            throw new Exception("Erro ao executar a query: ".$stmt->error); 
        } 
    }
    
    $conn->commit();
    http_response_code(200);
    echo json_encode(["message"=>"Data inserted successfully"]); 
}
catch(Exception $e) {
    $conn->rollback();
    echo json_encode(["error"=>"Error: ".$e->getMessage()]); 
}
finally{
    $stmt->close();
    $conn->close(); 
}
?>
