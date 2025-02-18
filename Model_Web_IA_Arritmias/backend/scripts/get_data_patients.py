import wfdb
import mysql.connector
from mysql.connector import Error
from datetime import datetime  # Importar para manipulação de datas e horas

# Variáveis do paciente, diretório do banco de dados pela wfdb, taxa de amostragem e id_patient do mySQL
patient_code = '100'
id_patient = 1
pn_dir = 'mitdb'
sampling_rate = 360

try:
    # Conectar ao MySQL
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="arritmias",
        autocommit=True
    )

    if connection.is_connected():
        print("Conexão bem-sucedida ao MySQL")

        # Capturar a hora inicial
        start_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Formato: Ano-Mês-Dia Hora:Minuto:Segundo

        # Baixar o registro do paciente
        record = wfdb.rdrecord(patient_code, pn_dir=pn_dir, channels=[0])

        # Extrair os valores do ECG
        ecg_values = record.p_signal[:, 0]
        time_interval = 1 / sampling_rate

        # Criar cursor para executar queries
        cursor = connection.cursor()

        # Query de inserção ajustada para incluir start_datetime
        insert_query = "INSERT INTO ecg (start_datetime, id_patient, value, type_collect) VALUES (%s, %s, %s, %s)"

        # Inserir em lotes
        batch_size = 100
        batch_data = []

        print('Inserindo dados do paciente {}...'.format(id_patient))
        for i, value in enumerate(ecg_values):
            # Adicionar a hora inicial, id_patient e o valor do ECG ao lote
            batch_data.append((start_datetime, id_patient, float(value), "MITBIH"))

            # Quando o lote atingir o tamanho, insere e limpa o lote
            if len(batch_data) == batch_size:
                cursor.executemany(insert_query, batch_data)
                batch_data = []

        # Inserir dados restantes
        if batch_data:
            cursor.executemany(insert_query, batch_data)

        print(f"Inserção de {len(ecg_values)} registros concluída.")

except Error as e:
    print(f"Erro ao conectar ou inserir dadaos no MySQL: {e}")

finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("Conexão ao MySQL foi encerrada.")