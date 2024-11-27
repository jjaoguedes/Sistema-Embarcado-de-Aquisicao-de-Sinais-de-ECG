<?php

// Cabeçalhos para permitir solicitações CORS, se necessário
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Recebe os dados JSON enviados via POST
$data = file_get_contents("php://input");

echo $data;

// Decodifica o JSON
$jsonData = json_decode($data, true);
//echo $jsonData;


// Verifica se a decodificação foi bem-sucedida
if ($jsonData === null) {
    // Se não for válido, retorna um erro
    echo json_encode(["status" => "erro", "message" => "Dados JSON invalidos"]);
    exit;
}

// Verifica se o campo 'dados' está presente no JSON
if (!isset($jsonData['dados'])) {
    echo json_encode(["status" => "erro", "message" => "'dados' nao encontrado no JSON"]);
    exit;
}

// O conteúdo de 'dados' é a string com os dados CSV
$dados = $jsonData['dados'];

// Caminho do arquivo CSV onde os dados serão gravados
$csvFile = 'dados_ecg_servidor.csv';

// Abre o arquivo CSV para append (adicionar no final)
$file = fopen($csvFile, 'a');

// Verifica se o arquivo foi aberto com sucesso
if ($file === false) {
    echo json_encode(["status" => "erro", "message" => "Falha ao abrir o arquivo CSV"]);
    exit;
}

// Processa cada linha de dados recebida (CSV no formato "timestamp,valorECG")
$lines = explode("\n", $dados);
foreach ($lines as $line) {
    // Ignora linhas vazias
    if (empty($line)) continue;
    
    // Divide cada linha em "timestamp" e "valorECG"
    $fields = explode(",", $line);
    
    // Se houver um número correto de campos, insira no CSV
    if (count($fields) == 2) {
        $timestamp = $fields[0];
        $valorECG = $fields[1];
        
        // Grava a linha no arquivo CSV
        fputcsv($file, [$timestamp, $valorECG]);
    }
}

// Fecha o arquivo CSV
fclose($file);

// Retorna uma resposta de sucesso
echo json_encode(["status" => "sucesso", "message" => "Dados recebidos e gravados com sucesso"]);
?>