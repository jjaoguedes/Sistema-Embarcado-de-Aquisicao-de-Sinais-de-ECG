<?php
// Lê o corpo da requisição (JSON enviado pelo fetch)
$request_body = file_get_contents('php://input');

// Decodifica o JSON para um array
$data = json_decode($request_body, true);

// Exibe os dados recebidos para depuração (opcional)
//file_put_contents('php://stderr', print_r($data, true));

// Envia os dados para o script Python via execução de linha de comando
$data_json = json_encode($data);  // Garante que os dados sejam um JSON válido

$command = 'set PYTHONPATH=C:/Users/jvito/AppData/Local/Programs/Python/Python311/Lib/site-packages && '
         . escapeshellcmd("C:/Users/jvito/AppData/Local/Programs/Python/Python311/python.exe")
         . " C:/Apache24/htdocs/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Web_Model_IA_Iris/predict.py"
         . " " . escapeshellarg($data_json);

// Executa o comando e captura a saída
$output = shell_exec($command . " 2>&1");  // "2>&1" captura erros também

// Extrair apenas o JSON da saída do script Python
preg_match('/\{.*\}/s', $output, $matches); // Pega a primeira ocorrência de JSON

// Verifica se o JSON foi encontrado
if (!empty($matches)) {
    $output_json = $matches[0];  // Extrai o JSON da string
    $decoded_output = json_decode($output_json, true);  // Decodifica o JSON

    // Agora extraímos as previsões e a classe predita
    $previsao = $decoded_output['previsao'][0];  // Probabilidades das classes
    $y_pred = $decoded_output['y_pred'][0];  // Classe predita (0, 1 ou 2)

    // Definindo as classes
    $classes = ["Iris-setosa", "Iris-versicolor", "Iris-virginica"];

    // Criando a resposta para enviar ao frontend
    $response = [
        'classe_predita' => $classes[$y_pred],
        'probabilidades' => []
    ];

    // Adicionando as probabilidades para cada classe
    foreach ($previsao as $index => $prob) {
        $response['probabilidades'][] = [
            'classe' => $classes[$index],
            'probabilidade' => round($prob * 100, 2)  // Convertendo a probabilidade para porcentagem
        ];
    }

    // Envia a resposta como JSON
    header('Content-Type: application/json');
    echo json_encode($response);  // Retorna a resposta JSON para o frontend

} else {
    // Se o JSON não foi encontrado, retorna uma resposta de erro
    echo json_encode(["error" => "O JSON não foi encontrado na saída do Python."]);
}
?>
