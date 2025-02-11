import sys
import json
import tensorflow as tf
import numpy as np

def normalize_data(data):
    min_val = np.min(data)
    max_val = np.max(data)
    return (data - min_val) / (max_val - min_val) if max_val > min_val else data

# Lê os dados da entrada
temp_file_path = sys.argv[1]

try:
    with open(temp_file_path, 'r') as file:
        data = json.load(file)

    numeric_value = data["ecgData"]  # Acessa o valor numérico

    # Converte os dados para um array NumPy
    array = np.array(numeric_value, dtype=float)
    
    #array = normalize_data(array)

    # Ajusta a forma do array para o modelo
    array = np.expand_dims(array, axis=-1)
    array = np.expand_dims(array, axis=0)



    # Tenta carregar o modelo
    try:
        model = tf.keras.models.load_model("C:/xampp/htdocs/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/models/Conv_1D_8c.h5")
        #output = {"status": "success", "message": "Modelo carregado com sucesso."}
    except Exception as e:
        #output = {"status": "error", "message": f"Erro ao carregar o modelo: {str(e)}"}
        #print(json.dumps(output))
        sys.exit(1)

    # Realiza a predição
    predictions = model.predict(array)  # Converte para lista
    y_pred = np.argmax(predictions, axis=1).tolist()  # Serializa como lista
    
    # Converte prediction para lista para compatibilidade com JSON
    prediction_list = predictions.tolist()

    # Prepara a saída
    output = {
        #"status": "success",
        #"message": "Predição realizada com sucesso.",
        "predictions": prediction_list
        #"y_pred": y_pred
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