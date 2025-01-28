#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Credenciais do WiFi
const char* ssid = "CLARO_2GEA41ED";
const char* password = "B8EA42ED";

// URL do servidor Apache
const char* serverURL = "http://192.168.0.121/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/insert_ecg_esp32.php";

const unsigned long sampleInterval = 2780;   // Intervalo de amostragem ajustado para ~360Hz (2780 microssegundos)
const unsigned long storageInterval = 4440;  // Tempo de armazenamento (4.44 segundos)

// Buffers para armazenar dados
std::vector<float> valuesBuffer;
// Cria documento JSON
StaticJsonDocument<120000> jsonDocument;
unsigned long lastSampleTime = 0;

// Semáforo para sincronização
SemaphoreHandle_t dataMutex;

void setup() {
  Serial.begin(115200);

  // Configura WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao WiFi...");
  }
  Serial.println("Conectado ao WiFi!");

  // Inicializa semáforo
  dataMutex = xSemaphoreCreateMutex();

  // Inicia tarefas
  xTaskCreatePinnedToCore(taskReadData, "ReadData", 4096, NULL, 1, NULL, 0);  // Núcleo 0
  xTaskCreatePinnedToCore(taskSendData, "SendData", 4096, NULL, 1, NULL, 1);  // Núcleo 1
}

void taskReadData(void* pvParameters) {
  while (true) {
    unsigned long currentTime = micros();
    if (currentTime - lastSampleTime >= sampleInterval) {
      lastSampleTime = currentTime;

      // Simula leitura do sensor
      float valueECG = random(0, 2000) / 1000.0;  // Valores simulados entre 0.0 e 2.0

      // Protege o acesso aos buffers
      if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
        valuesBuffer.push_back(valueECG);
        xSemaphoreGive(dataMutex);
      }
    }
    // Libera a CPU sem introduzir atrasos significativos
    taskYIELD();
  }
}


void taskSendData(void* pvParameters) {
  while (true) {
    vTaskDelay(storageInterval / portTICK_PERIOD_MS);  // Aguarda o intervalo de envio

    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      if (!valuesBuffer.empty()) {
        Serial.println("Enviando dados...");
        sendData(valuesBuffer);

        // Limpa os buffers após o envio
        valuesBuffer.clear();
        // Limpa buffers e JSON
        valuesBuffer.clear();
        valuesBuffer.shrink_to_fit();  // Libera memória extra
        jsonDocument.clear();          // Limpa o JSON
      }
      xSemaphoreGive(dataMutex);
    }
  }
}

void sendData(const std::vector<float>& values) {
  // Monitoramento da memória
  Serial.println("Memória heap disponível: " + String(ESP.getFreeHeap()) + " bytes");
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);


    jsonDocument["patient_id"] = 1;

    // Adiciona os dados das medições
    // Criação da estrutura measurements com value e datetime
    JsonObject measurements = jsonDocument.createNestedObject("measurements");
    JsonArray valuesArray = measurements.createNestedArray("value");
    //JsonArray datetimeArray = measurements.createNestedArray("datetime");
    Serial.println(values.size());
    //Serial.println(timestamps.size());
    for (size_t i = 0; i < values.size(); i++) {
      valuesArray.add(values[i]);
      //datetimeArray.add(timestamps[i]);
    }

    // Serializa o JSON
    String jsonString;
    serializeJson(jsonDocument, jsonString);

    Serial.println(jsonString);

    // Envia os dados
    http.addHeader("Content-Type", "application/json");
    int responseCode = http.POST(jsonString);
    jsonString = "";
    // Verifica a resposta HTTP
    if (responseCode > 0) {
      if (responseCode == HTTP_CODE_OK) {
        Serial.println("Dados enviados com sucesso!");
      } else {
        Serial.println("Falha ao enviar dados. Código: " + String(responseCode));
      }
    } else {
      Serial.println("Erro na conexão: " + String(http.errorToString(responseCode).c_str()));
    }
    http.end();

  } else {
    Serial.println("WiFi não está conectado.");
  }
}

void loop() {
  // O loop principal não faz nada; as tarefas são executadas em paralelo
}
