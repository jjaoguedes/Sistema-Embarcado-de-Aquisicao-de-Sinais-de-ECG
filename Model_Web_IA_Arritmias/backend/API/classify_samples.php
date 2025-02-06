<?php
header('Content-Type: application/json');

// Lê o corpo da requisição (JSON enviado pelo fetch)
$request_body = file_get_contents('php://input');
$data = json_decode($request_body, true);

// Exibe os dados recebidos para depuração (opcional)
//file_put_contents('php://stderr', print_r($data, true));

// Garante que os dados sejam um JSON válido
$data_json = json_encode($data);

// Criando um arquivo temporário
$temp_file = tempnam(sys_get_temp_dir(), 'data_');
file_put_contents($temp_file, $data_json);

// Caminhos para os scripts Python e modelos
$python_script_cb = "C:/xampp/htdocs/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/scripts/model_binary.py";
$python_script_8c = "C:/xampp/htdocs/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/scripts/model_eight_classes.py";
$python_executable = "C:/Users/ALUNO/AppData/Local/Programs/Python/Python311/python.exe";

// Função para executar o script Python com diferentes modelos
function execute_python_script($python_executable, $python_script, $temp_file) {
    $command = 'set PYTHONPATH=C:/Users/ALUNO/AppData/Local/Programs/Python/Python311/Lib/site-packages && '
             . escapeshellcmd($python_executable)
             . " " . escapeshellarg($python_script)
             . " " . escapeshellarg($temp_file);

    $output = shell_exec($command . " 2>&1");
    //file_put_contents('php://stderr', print_r($output, true));

    // Extrair apenas o JSON da saída do script Python
    preg_match('/\{.*\}/s', $output, $matches);
    return json_decode($matches[0] ?? '{}', true);
}

// Função para converter probabilidades para porcentagens
function convert_to_percentages($probabilities) {
    return array_map(function ($value) {
        return round($value * 100, 2); // Multiplica por 100 e arredonda para 2 casas decimais
    }, $probabilities);
}

// Executa os dois modelos e processa os resultados
$response_binary = execute_python_script($python_executable, $python_script_cb, $temp_file);
$response_multi = execute_python_script($python_executable, $python_script_8c, $temp_file);

// Consolida os resultados
$response = [
    'binary_model' => [
        'predict_class' => $response_binary['y_pred'][0][0],
        'probabilities' => round($response_binary['prediction'][0][0] * 100, 2) // Convertido para porcentagem
    ],
    'eight_class_model' => [
        'probabilities' => convert_to_percentages($response_multi['predictions'][0]) // Array convertido para porcentagens
    ]
];

// Log para debug
//file_put_contents('php://stderr', print_r($response, true));

// Envia a resposta como JSON
header('Content-Type: application/json');
echo json_encode($response);

// Deleta o arquivo temporário após o uso
unlink($temp_file);
