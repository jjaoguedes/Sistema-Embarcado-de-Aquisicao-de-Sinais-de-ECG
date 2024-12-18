import wfdb
import mysql.connector
from mysql.connector import Error

#Variáveis do paciente, diretório do banco de dados pela wfdb, taxa de amostragem e id_patient do mySQL
patient_code = '119'
id_patient = 5
pn_dir = 'mitdb'
sampling_rate = 360

try:
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="arritmias",
        autocommit=True
    )

    if connection.is_connected():
        print("Conexão bem-sucedida ao MySQL")

        # Baixar o registro do paciente
        record = wfdb.rdrecord(patient_code, pn_dir=pn_dir, channels=[0])

        ecg_values = record.p_signal[:, 0]
        time_interval = 1 / sampling_rate

        cursor = connection.cursor()
        insert_query = "INSERT INTO ecg (id_patient, time, value) VALUES (%s, %s, %s)"

        # Inserir em lotes
        batch_size = 1600
        batch_data = []

        print('Inserindo dados do paciente {}...'.format(id_patient))
        for i, value in enumerate(ecg_values):
            time = i * time_interval
            batch_data.append((id_patient, float(time), float(value)))

            # Quando o lote atingir o tamanho, insere e limpa o lote
            if len(batch_data) == batch_size:
                cursor.executemany(insert_query, batch_data)
                batch_data = []

        # Inserir dados restantes
        if batch_data:
            cursor.executemany(insert_query, batch_data)

        print(f"Inserção de {len(ecg_values)} registros concluída.")

except Error as e:
    print(f"Erro ao conectar ou inserir dados no MySQL: {e}")

finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("Conexão ao MySQL foi encerrada.")
