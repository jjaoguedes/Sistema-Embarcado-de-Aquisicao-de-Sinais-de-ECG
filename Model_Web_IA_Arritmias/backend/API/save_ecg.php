<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
require_once 'config.php';

// Lê o corpo da requisição (JSON enviado pelo fetch)
$input = json_decode(file_get_contents('php://input'), true);

$response = [
    'success' => false,
    'message' => '',
    'processedData' => []
];

try {
    if (!empty($input['ecgValues'])) {
        // Criar um arquivo temporário para armazenar os dados
        $temp_file = tempnam(sys_get_temp_dir(), 'ecg_');
        file_put_contents($temp_file, json_encode(["ecgValues" => $input['ecgValues']]));

        // Caminhos dos scripts Python e executável
        $python_script = "C:/xampp/htdocs/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/scripts/filterData.py";

        // Função para executar o script Python
        function execute_python_script($python_script, $temp_file) {
            $command = 'set PYTHONPATH=' . PYTHON_PATH . ' && '
             . escapeshellcmd(PYTHON_EXECUTABLE)
             . " " . escapeshellarg($python_script)
             . " " . escapeshellarg($temp_file);

            $output = shell_exec($command . " 2>&1");
            
            // Extrair apenas o JSON da saída do script Python
            preg_match('/\{.*\}/s', $output, $matches);
            return json_decode($matches[0] ?? '{}', true);
        }

        // Executar o script Python e obter os dados processados
        $processed_data = execute_python_script($python_script, $temp_file);
        file_put_contents('php://stderr', print_r($processed_data, true));

        
        if (!empty($processed_data['processedData'])) {
            $response['success'] = true;
            $response['message'] = 'Dados de ECG processados com sucesso';
            $response['processedData'] = $processed_data['processedData'];
        } else {
            $response['message'] = 'Erro ao processar os dados';
        }
    } else {
        $response['message'] = 'Nenhum dado de ECG recebido';
    }
} catch (Exception $e) {
    $response['message'] = 'Erro no processamento: ' . $e->getMessage();
}

http_response_code($response['success'] ? 200 : 400);
echo json_encode($response);
?>
