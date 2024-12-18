<?php
header('Content-Type: application/json');

// Lê o corpo da requisição (JSON enviado pelo fetch)
$request_body = file_get_contents('php://input');

// Decodifica o JSON para um array
$data = json_decode($request_body, true);

// Exibe os dados recebidos para depuração (opcional)
file_put_contents('php://stderr', print_r($data, true));

// Envia os dados para o script Python via execução de linha de comando
$data_json = json_encode($data);  // Garante que os dados sejam um JSON válido

/*if (!isset($data['ecgData'])) {
    echo json_encode(['status' => 'error', 'message' => 'Dados inválidos.']);
    exit;
}*/

// Criando um arquivo temporário
$temp_file = tempnam(sys_get_temp_dir(), 'data_');  // Cria um arquivo temporário

// Escrevendo o JSON no arquivo temporário
file_put_contents($temp_file, $data_json);

// Caminho para o script Python do modelo
$python_script = "C:/xampp/htdocs/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/scripts/model_binary.py";

// Comando para executar o script Python com o caminho do arquivo temporário como argumento
#C:/Users/ALUNO/AppData/Local/Programs/Python/Python311/python.exe
#C:/Users/jvito/AppData/Local/Programs/Python/Python311/Lib/site-packages
#C:/Users/ALUNO/AppData/Local/Programs/Python/Python311/python.exe
$command = 'set PYTHONPATH=C:/Users/jvito/AppData/Local/Programs/Python/Python311/Lib/site-packages && '
         . escapeshellcmd("C:/Users/jvito/AppData/Local/Programs/Python/Python311/python.exe") #C:/Users/jvito/AppData/Local/Programs/Python/Python311/Lib/site-packages
         . " " . escapeshellarg($python_script)
         . " " . escapeshellarg($temp_file);

// Executa o comando e captura a saída
$output = shell_exec($command . " 2>&1");  // "2>&1" captura erros também
file_put_contents('php://stderr', print_r($output, true));

// Extrair apenas o JSON da saída do script Python
preg_match('/\{.*\}/s', $output, $matches); // Pega a primeira ocorrência de JSON

// Acessar o primeiro elemento do array e decodificar o JSON
$jsonString = $matches[0];
$decodedData = json_decode($jsonString, true); // Decodifica para um array associativo

// Acessar os valores
$prediction = $decodedData['prediction'][0][0]; // Acessa o valor único dentro de prediction
$y_pred = $decodedData['y_pred'][0][0]; // Acessa o valor único dentro de y_pred

// Criando a resposta para enviar ao frontend
$response = [
    'predict_class' => $y_pred,
    'probabilities' => [
        [
            'class' => $y_pred,
            'probability' => round($prediction * 100, 2) // Convertendo para porcentagem
        ]
    ]
];

// Log para debug
file_put_contents('php://stderr', print_r($response, true));

 // Envia a resposta como JSON
 header('Content-Type: application/json');
 echo json_encode($response);  // Retorna a resposta JSON para o frontend

// Opcional: Deletar o arquivo temporário após o uso
unlink($temp_file);
