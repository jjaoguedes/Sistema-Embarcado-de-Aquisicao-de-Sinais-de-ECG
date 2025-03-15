<?php
header('Content-Type: application/json');
require_once 'config.php';

// Configurações do banco de dados
$username = "root"; // Altere conforme necessário
$password = "";     // Altere conforme necessário
$database = "arritmias"; // Nome correto do banco de dados

try {
    // Conexão com o banco de dados
    $conn = new mysqli($host, $username, $password, $database);

    // Testar conexão
    if ($conn->connect_error) {
        throw new Exception("Erro de conexão: " . $conn->connect_error);
    }

    // Consulta para buscar pacientes
    $query = "SELECT id_patient, name, age FROM patient";
    $result = $conn->query($query);

    if (!$result) {
        throw new Exception("Erro na consulta: " . $conn->error);
    }

    // Criar a lista de pacientes
    $patients = [];
    while ($row = $result->fetch_assoc()) {
        $patients[] = $row;
    }

    // Retornar os dados em formato JSON
    echo json_encode($patients);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    // Fechar a conexão com o banco de dados
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>