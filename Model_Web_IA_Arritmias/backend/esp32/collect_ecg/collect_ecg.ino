#include <WiFi.h>  // Para ESP32
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define ECG_INPUT_PIN A0

const int sampleRate = 360;                 // Hz
const int numSamples = 10800;               // 30 segundos de coleta (360 amostras/s * 30s)
const unsigned long sampleInterval = 2778;  // Intervalo de amostragem para 360Hz (2778 µs)

// Buffer para armazenar os dados
float valuesBuffer[numSamples];
size_t bufferIndex = 0;

// Configurações de Wi-Fi
const char* ssid = "WP3-CETELI-2-IA";
const char* password = "RioNhamunda";

// Endereço do servidor
const char* serverUrl = "http://10.224.1.28/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/insert_ecg_esp32.php";

// ID do paciente (substitua pelo ID real)
const String id_patient = "15";
const int batchSize = 100;  // Tamanho do lote

// Servidor NTP
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -14400;
const int daylightOffset_sec = 0;
String datetime = "";

void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando coleta de ECG...");

  // Conecta ao Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao Wi-Fi...");
  }
  Serial.println("Conectado ao Wi-Fi!");

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  struct tm timeInfo;
  while (!getLocalTime(&timeInfo)) {
    Serial.println("Falha ao obter hora NTP");
    delay(1000);
  }
  Serial.println("Hora sincronizada com NTP.");

  // Aguarda 2 segundos antes de começar a coleta
  delay(1000);

  // Inicio da coleta
  datetime = getDatetime();
  Serial.println("Datetime Inicial Armazendado");

}


String getDatetime() {
  struct tm timeInfo;
  if (getLocalTime(&timeInfo)) {
    char datetime[20];
    strftime(datetime, sizeof(datetime), "%Y-%m-%d %H:%M:%S", &timeInfo);
    return String(datetime);
  }
  return "Falha ao obter hora";
}

void normalizeBuffer(float valuesBuffer[], int numSamples) {
  float minVal = valuesBuffer[0];
  float maxVal = valuesBuffer[0];

  // Encontra o valor mínimo e máximo no buffer
  for (int i = 0; i < numSamples; i++) {
    if (valuesBuffer[i] < minVal) {
      minVal = valuesBuffer[i];
    }
    if (valuesBuffer[i] > maxVal) {
      maxVal = valuesBuffer[i];
    }
  }

  // Normaliza os valores para o intervalo [0, 1]
  for (int i = 0; i < numSamples; i++) {
    valuesBuffer[i] = (valuesBuffer[i] - minVal) / (maxVal - minVal);
  }
}

void sendDataToServer(float valuesBuffer[], int numSamples) {
  int totalBatches = (numSamples + batchSize - 1) / batchSize;  // Número total de lotes

  for (int batch = 0; batch < totalBatches; batch++) {
    // Calcula o tamanho necessário para o JSON
    const size_t jsonSize = JSON_OBJECT_SIZE(2) + JSON_ARRAY_SIZE(batchSize) + batchSize * 10;
    DynamicJsonDocument jsonDoc(jsonSize);

    // Preenche o JSON
    jsonDoc["id_patient"] = id_patient;
    jsonDoc["start_datetime"] = datetime;  // Função para obter data/hora atual

    JsonArray valuesArray = jsonDoc.createNestedArray("values");

    // Preenche o JSON com os valores do lote
    int startIndex = batch * batchSize;
    int endIndex = min(startIndex + batchSize, numSamples);

    for (int i = startIndex; i < endIndex; i++) {
      valuesArray.add(valuesBuffer[i]);
    }

    // Serializa o JSON para uma string
    String jsonString;
    serializeJson(jsonDoc, jsonString);
    Serial.println(jsonString);

    // Envia o JSON para o servidor
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int retryCount = 3;
    int httpResponseCode = -1;

    while (retryCount > 0) {
      httpResponseCode = http.POST(jsonString);
      if (httpResponseCode > 0) {
        break;  // Sucesso, sair do loop de retentativa
      }
      retryCount--;
      delay(500);  // Aguarda antes de tentar novamente
    }

    if (httpResponseCode > 0) {
      Serial.print("Lote ");
      Serial.print(batch + 1);
      Serial.print(" enviado com sucesso! Resposta: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Erro ao enviar lote ");
      Serial.print(batch + 1);
      Serial.print(": ");
      Serial.println(httpResponseCode);
    }

    http.end();

    // Aguarda um pouco antes de enviar o próximo lote (opcional)
    delay(100);
  }
}

void loop() {
  unsigned long startTime = micros();  // Marca o tempo inicial da coleta

  // Coleta de 30 segundos
  for (bufferIndex = 0; bufferIndex < numSamples; bufferIndex++) {
    // Aguarda até o tempo correto para a próxima amostra
    while (micros() - startTime < bufferIndex * sampleInterval) {
      // Aguarda passivamente
    }

    // Lê o valor do ECG e converte para float
    valuesBuffer[bufferIndex] = (float)analogRead(ECG_INPUT_PIN);
  }

  Serial.println("Coleta concluída! Enviando dados para o servidor...");

  // Normaliza os valores do buffer
  normalizeBuffer(valuesBuffer, numSamples);

  // Envia os dados em lotes
  sendDataToServer(valuesBuffer, numSamples);

  Serial.println("Fim dos dados.");

  while (1)
    ;  // Para a execução do loop, pois a coleta já foi feita
}