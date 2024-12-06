<?php
header('Content-Type: application/json');

// Recebe o JSON enviado pelo cliente
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['ecgData'])) {
    echo json_encode(['status' => 'error', 'message' => 'Dados inválidos.']);
    exit;
}

// Aqui você pode salvar os dados no banco de dados ou processá-los
// Exemplo de salvamento em arquivo
$file = 'ecg_data_' . time() . '.json';
file_put_contents($file, json_encode($data['ecgData']));

echo json_encode(['status' => 'success', 'message' => 'Dados salvos com sucesso.']);