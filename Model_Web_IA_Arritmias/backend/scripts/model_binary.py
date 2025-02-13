import sys
import json
import tensorflow as tf
import numpy as np
from scipy import signal

def normalize_data(data):
    min_val = np.min(data)
    max_val = np.max(data)
    if max_val > min_val:
        return (data - min_val) / (max_val - min_val)
    else:
        # Se os dados são constantes, retorne um array de zeros ou uns
        return np.zeros_like(data)  # Ou np.ones_like(data) dependendo do comportamento desejado


def bandpass_filter(data, lowcut, highcut, fs, order=2):
    nyquist = 0.5 * fs
    low = lowcut / nyquist
    high = highcut / nyquist
    b, a = signal.butter(order, [low, high], btype='band')
    return signal.filtfilt(b, a, data)

def moving_average(data, window_size):
    window = np.ones(window_size) / window_size
    return np.convolve(data, window, mode='same')

# Lê os dados da entrada
temp_file_path = sys.argv[1]

try:
    with open(temp_file_path, 'r') as file:
        data = json.load(file)

    numeric_value = data["ecgData"]  # Acessa o valor numérico

    # Converte os dados para um array NumPy
    array = np.array(numeric_value, dtype=float)

    # Parâmetros do filtro passa-banda
    target_fs = 360    # Frequência de amostragem desejada (360Hz)
    lowcut = 0.5  # Limite inferior da banda de passagem
    highcut = 40.0  # Limite superior da banda de passagem

    # Aplica o filtro passa-banda ao sinal reamostrado
    filtered_array = bandpass_filter(array, lowcut, highcut, target_fs)

    # Aplicar média móvel para suavizar o sinal
    window_size = 10 # Tamanho da janela
    smoothed_signal = moving_average(filtered_array, window_size)

    # Normaliza os dados filtrados
    normalized_array = normalize_data(smoothed_signal)

    # Ajusta a forma do array para o modelo
    normalized_array = np.expand_dims(normalized_array, axis=-1)
    normalized_array = np.expand_dims(normalized_array, axis=0)

    # Tenta carregar o modelo
    try:
        model = tf.keras.models.load_model("C:/xampp/htdocs/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/models/conv1D_cb.h5")
        #output = {"status": "success", "message": "Modelo carregado com sucesso."}
    except Exception as e:
        #output = {"status": "error", "message": f"Erro ao carregar o modelo: {str(e)}"}
        sys.exit(1)

    # Realiza a predição
    prediction = model.predict(normalized_array)  # Converte para lista
    y_pred = np.where(prediction > 0.5, 1, 0).tolist()  # Serializa como lista

    # Converte prediction para lista para compatibilidade com JSON
    prediction_list = prediction.tolist()

    # Prepara a saída
    output = {
        "prediction": prediction_list,
        "y_pred": y_pred
    }

    # Imprime a saída final
    print(json.dumps(output))

except json.JSONDecodeError as e:
    output = {"status": "error", "message": f"Erro ao decodificar JSON: {str(e)}"}
    print(json.dumps(output))
    sys.exit(1)
except ValueError as e:
    output = {"status": "error", "message": f"Erro nos dados de entrada: {str(e)}"}
    print(json.dumps(output))
    sys.exit(1)
except Exception as e:
    output = {"status": "error", "message": f"Erro inesperado: {str(e)}"}
    print(json.dumps(output))
    sys.exit(1)