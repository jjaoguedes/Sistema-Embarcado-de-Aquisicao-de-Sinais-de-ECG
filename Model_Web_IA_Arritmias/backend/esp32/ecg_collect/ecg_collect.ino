#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <vector>

// Credenciais do WiFi
const char* ssid = "WP3-CETELI-2-IA";
const char* password = "RioNhamunda";

// URL do servidor
const char* serverURL = "http://10.224.1.28/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/insert_ecg_esp32.php";

const unsigned long sampleInterval = 2780;
const unsigned long storageInterval = 4440;

String datetime = "";

// Semáforo para sincronização
SemaphoreHandle_t dataMutex;

// Servidor NTP
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -14400;
const int daylightOffset_sec = 0;

// Buffers e variáveis globais
const size_t bufferSize = 1600;  // Tamanho fixo do buffer
float valuesBuffer[bufferSize];
size_t bufferIndex = 0;

int executionCount = 0;
HTTPClient http;

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - startTime > 10000) {
      Serial.println("Falha ao conectar ao WiFi.");
      return;
    }
    delay(1000);
    Serial.println("Conectando ao WiFi...");
  }
  Serial.println("Conectado ao WiFi!");

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  struct tm timeInfo;
  while (!getLocalTime(&timeInfo)) {
    Serial.println("Falha ao obter hora NTP");
    delay(1000);
  }
  Serial.println("Hora sincronizada com NTP.");

  dataMutex = xSemaphoreCreateMutex();
  if (dataMutex == NULL) {
    Serial.println("Falha ao criar o mutex.");
    return;
  }

  xTaskCreatePinnedToCore(taskReadData, "ReadData", 4096, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(taskSendData, "SendData", 4096, NULL, 1, NULL, 1);
}

void taskReadData(void* pvParameters) {
  unsigned long lastSampleTime = micros();
  while (true) {
    unsigned long currentTime = micros();
    if (currentTime - lastSampleTime >= sampleInterval) {
      lastSampleTime = currentTime;
      datetime = getDatetime();
      float valueECG = analogRead(A0);

      if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
        if (bufferIndex < bufferSize) {
          valuesBuffer[bufferIndex++] = valueECG;
        }
        xSemaphoreGive(dataMutex);
      }
    }
    if (executionCount >= 7) {
      Serial.println("taskReadData encerrada.");
      vTaskDelete(NULL);
    }
    vTaskDelay(1);
  }
}

void taskSendData(void* pvParameters) {
  while (true) {
    vTaskDelay(storageInterval / portTICK_PERIOD_MS);

    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      if (bufferIndex > 0) {  // Verifica se há dados no buffer
        Serial.println("Enviando dados...");

        // Converte o array simples em um std::vector<float>
        std::vector<float> values(valuesBuffer, valuesBuffer + bufferIndex);

        normalizeValues(values);
        sendData(values);
        bufferIndex = 0; // Limpa o buffer
        executionCount++;
        Serial.println("Execução número: " + String(executionCount));
      }
      xSemaphoreGive(dataMutex);
    }

    if (executionCount >= 7) {
      Serial.println("taskSendData encerrada.");
      vTaskDelete(NULL);
    }
  }
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

void sendData(const std::vector<float>& values) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);

    DynamicJsonDocument jsonDocument(1024);
    jsonDocument["patient_id"] = 15;
    jsonDocument["start_datetime"] = datetime;
    JsonArray valuesArray = jsonDocument.createNestedArray("value");

    for (size_t i = 0; i < values.size(); i++) {
      valuesArray.add(values[i]);
    }

    String jsonString;
    serializeJson(jsonDocument, jsonString);
    //Serial.println(jsonString);
    http.addHeader("Content-Type", "application/json");
    int responseCode = http.POST(jsonString);

    if (responseCode == HTTP_CODE_OK) {
      String responseBody = http.getString();
      Serial.println("Resposta do servidor: " + responseBody);
    } else {
      Serial.println("Falha ao enviar dados. Código HTTP: " + String(responseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi não está conectado.");
  }
}

void normalizeValues(std::vector<float>& values) {
  if (values.empty()) return;

  float min_value = *std::min_element(values.begin(), values.end());
  float max_value = *std::max_element(values.begin(), values.end());

  float range = max_value - min_value;
  if (range == 0) {
    for (float& value : values) value = 0.5f;
  } else {
    for (float& value : values) value = (value - min_value) / range;
  }
}

void loop() {}