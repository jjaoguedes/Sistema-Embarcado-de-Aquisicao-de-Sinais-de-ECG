<?php

// Cabeçalhos para permitir solicitações CORS, se necessário
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Recebe os dados JSON enviados via POST
$data = file_get_contents("php://input");

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

// Dados de conexão
$servername = "localhost"; // Pode ser 'localhost' ou o IP do servidor MySQL
$username = "root"; // Usuário MySQL
$password = ""; // Senha do MySQL
$dbname = "Arritmias"; // Nome do banco de dados

// Criando a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificando a conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}
echo "Conectado com sucesso!";

// O conteúdo de 'dados' é a string com os dados CSV
$dados = $jsonData['dados'];

// Processa cada linha de dados recebida
$lines = explode("\n", $dados);
foreach ($lines as $line) {
    // Ignora linhas vazias
    if (empty($line)) continue;

    // Divide cada linha em "timestamp" e "valorECG"
    $fields = explode(",", $line);

    // Se houver um número correto de campos, insira no banco de dados
    if (count($fields) == 2) {
        $timestamp = $fields[0];
        $valorECG = $fields[1];

        // Prepara o comando SQL para inserir os dados no banco de dados
        $stmt = $conn->prepare("INSERT INTO ECG (time, value) VALUES (?, ?)");
        $stmt->bind_param("ss", $timestamp, $valorECG); // 'd' para double (valorECG) e 's' para string (time)

        // Executa a inserção
        if ($stmt->execute()) {
            echo "Dados inseridos com sucesso!<br>";
        } else {
            echo "Erro ao inserir dados: " . $stmt->error . "<br>";
        }

        // Fecha a declaração preparada
        $stmt->close();
    }
}

// Fecha a conexão com o banco de dados
$conn->close();

// Retorna uma resposta de sucesso
echo json_encode(["status" => "sucesso", "message" => "Dados recebidos e Inseridos com sucesso"]);

?>
