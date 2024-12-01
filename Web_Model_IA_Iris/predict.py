import os
import sys
import json
import numpy as np
import tensorflow as tf
import contextlib

# Definir variáveis de ambiente para suprimir logs do TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # '3' suprime INFO, WARNINGS, etc.
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Desativa operações oneDNN

# Definir o nível de log do TensorFlow para ERROR
tf.get_logger().setLevel('ERROR')

@contextlib.contextmanager
def suppress_stderr():
    """Suprime mensagens stderr (inclusive de bibliotecas em C/C++)."""
    with open(os.devnull, 'w') as fnull:
        old_stderr = sys.stderr
        sys.stderr = fnull
        try:
            yield
        finally:
            sys.stderr = old_stderr

# Processamento do JSON
input_json = sys.argv[1]

try:
    data = json.loads(input_json)
except json.JSONDecodeError as e:
    print(json.dumps({"error": f"Erro ao decodificar JSON: {e}"}))
    sys.exit(1)

try:
    array = np.array(data, dtype=float)  # Converte os dados diretamente em um array NumPy
except ValueError as e:
    print(json.dumps({"error": f"Erro ao converter dados para NumPy array: {e}"}))
    sys.exit(1)

# Assegure-se de que a entrada tenha a forma correta (1, 4)
array = np.expand_dims(array, axis=0)  # Transforma (4,) em (1, 4)

# Carregar modelo e fazer previsões em contexto silenciado
with suppress_stderr():
    modelo = tf.keras.models.load_model("C:/Apache24/htdocs/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Web_Model_IA_Iris/model_iris.keras")
    previsao = modelo.predict(array).tolist()  # Converte para lista
    y_pred = np.argmax(previsao, axis=1).tolist()  # Serializa como lista

saida = {"previsao": previsao, "y_pred": y_pred}

# Imprimir apenas o JSON final
print(json.dumps(saida))
