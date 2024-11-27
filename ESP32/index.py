import serial
import time
import csv

# Configura a porta serial (substitua pela sua porta correta)
porta_serial = serial.Serial('COM8', 115200, timeout=1)
time.sleep(2)  # Aguarde a inicialização

# Variáveis para armazenamento temporário
dados_temporarios = []

# Abre o arquivo CSV para escrita (cria o cabeçalho)
with open('dados_ecg.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["Timestamp", "Valor_ECG"])  # Cabeçalho do CSV
    print("Cabeçalho CSV criado.")

try:
    while True:
        if porta_serial.in_waiting > 0:
            linha = porta_serial.readline().decode('utf-8').strip()
            if linha:
                # Divide a linha em timestamp e valor_ecg com base na vírgula
                dados = linha.split(',')
                if len(dados) == 2:
                    timestamp, valor_ecg = dados
                    dados_temporarios.append([timestamp, valor_ecg])  # Armazena os dados temporariamente
                    print(f"Recebido: {timestamp}, {valor_ecg}")  # Exibe no console

        # Grava os dados no arquivo CSV após um intervalo
        if dados_temporarios:
            with open('dados_ecg.csv', mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerows(dados_temporarios)  # Grava todos os dados temporários
                print(f"{len(dados_temporarios)} linhas gravadas no arquivo.")

            # Limpa a lista e reinicia o temporizador (se necessário)
            dados_temporarios.clear()

        time.sleep(0.1)  # Atraso para evitar sobrecarga da CPU

except KeyboardInterrupt:
    print("Finalizando gravação.")
finally:
    porta_serial.close()