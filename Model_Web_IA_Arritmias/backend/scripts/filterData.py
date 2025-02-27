import sys
import json
import tensorflow as tf
import numpy as np
from scipy import signal

def normalize_data(data):
    min_val = np.min(data)
    max_val = np.max(data)
    return (data - min_val) / (max_val - min_val) if max_val > min_val else data

# Função para aplicar um filtro passa-banda
def bandpass_filter(ecg_data, fs, lowcut=0.5, highcut=40.0):
    nyquist = 0.5 * fs
    low = lowcut / nyquist
    high = highcut / nyquist
    b, a = signal.butter(2, [low, high], btype="band")
    return signal.filtfilt(b, a, ecg_data)

# Função para pré-processar o sinal
def preprocess_signal(signal_data, fs):
    filtered_signal = bandpass_filter(signal_data, fs)
    notch_freq = 60
    b_notch, a_notch = signal.iirnotch(notch_freq, 30, fs)
    filtered_signal_notch = signal.filtfilt(b_notch, a_notch, filtered_signal)
    return normalize_data(filtered_signal_notch)

# Lê os dados da entrada
temp_file_path = sys.argv[1]

try:
    with open(temp_file_path, 'r') as file:
        data = json.load(file)

    numeric_value = data["ecgValues"]  # Acessa o valor numérico

    # Converte os dados para um array NumPy
    array = np.array(numeric_value, dtype=float)

    fs = 360

    signal_ecg_processed = preprocess_signal(array, fs)

    # Normaliza os dados filtrados
    normalized_array = signal_ecg_processed

    # Converte prediction para lista para compatibilidade com JSON
    normalized_array_list = normalized_array.tolist()

    # Prepara a saída
    output = {
        "processedData": normalized_array_list
        #"y_pred": y_pred  # Você pode incluir y_pred se necessário
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