#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Credenciais do WiFi
const char* ssid = "WP3-CETELI-2-IA";
const char* password = "RioNhamunda";

// URL do servidor Apache
const char* serverURL = "http://localhost/Sistema-Embarcado-de-Aquisicao-de-Sinais-de-ECG/Model_Web_IA_Arritmias/backend/API/insert_ecg_esp32.php";

const unsigned long sampleInterval = 2.78;   // Intervalo de amostragem para 360Hz (2.78 ms)
const unsigned long storageInterval = 4440;  // Tempo de armazenamento em milissegundos (4.44 segundos)

String dataStorage = "";  // Buffer para armazenar os dados
unsigned long lastSampleTime = 0;

// Buffers para armazenar dados
std::vector<float> valueBuffer;      // Armazena valores filtrados
std::vector<String> datetimeBuffer;  // Armazena timestamps formatados

// Mutex para proteger o acesso aos buffers
SemaphoreHandle_t dataMutex = xSemaphoreCreateMutex();

// Cliente NTP
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000);  // Atualiza a cada 60 segundos

const int FIR_ORDER = 17;  // Ordem do filtro FIR (número de coeficientes)
float firCoefficients[FIR_ORDER] = {
  // Coeficientes calculados para rejeitar baixas e altas frequências
  -0.0025, -0.0060, -0.0115, -0.0096, 0.0156, 0.0728, 0.1512,
  0.2207, 0.2486, 0.2207, 0.1512, 0.0728, 0.0156, -0.0096,
  -0.0115, -0.0060, -0.0025
};
float firBuffer[FIR_ORDER];  // Inicializa o buffer com zeros
float buffer[FIR_ORDER] = { 0.0 };

void setup() {
  Serial.begin(115200);

  // Setup para leads off LO + e LO-
  pinMode(41, INPUT);
  pinMode(40, INPUT);

  // Configura WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao WiFi...");
  }
  Serial.println("Conectado ao WiFi!");

  timeClient.begin();

  // Inicia tarefas
  xTaskCreatePinnedToCore(taskReadData, "ReadData", 4096, NULL, 1, NULL, 0);  // Núcleo 0
  xTaskCreatePinnedToCore(taskSendData, "SendData", 4096, NULL, 1, NULL, 1);  // Núcleo 1

  // Inicializar buffer do filtro FIR
  for (int i = 0; i < FIR_ORDER; i++) {
    firBuffer[i] = 0.0;
  }
}

// Função para processar uma amostra pelo filtro FIR
float applyFIRFilter(float newSample) {
  // Desloca o buffer para a direita
  for (int i = FIR_ORDER - 1; i > 0; i--) {
    buffer[i] = buffer[i - 1];
  }
  buffer[0] = newSample;  // Insere a nova amostra no início do buffer

  // Calcula a saída filtrada
  float output = 0.0;
  for (int i = 0; i < FIR_ORDER; i++) {
    output += firCoefficients[i] * buffer[i];
  }
  return output;
  ;
}

String getFormattedDateTime() {
  // Formata a data e hora no formato "YYYY-MM-DD HH:MM:SS"
  String formattedDate = timeClient.getFormattedDate();  // Formato: "YYYY-MM-DDTHH:MM:SSZ"
  String date = formattedDate.substring(0, 10);          // "YYYY-MM-DD"
  String time = formattedDate.substring(11, 19);         // "HH:MM:SS"
  return date + " " + time;
}

void taskReadData(void* pvParameters) {
  // Sincroniza o início com o tempo NTP
  timeClient.update();
  String currentDateTime = getFormattedDateTime();
  Serial.println(currentDateTime);

  while (true) {
    unsigned long currentTime = millis();
    if (currentTime - lastSampleTime >= sampleInterval) {

      // Captura dados do sensor
      unsigned long timestamp = currentDateTime  // data e hora formatada

        lastSampleTime = currentTime;  // Atualiza o último tempo de amostragem

      if ((digitalRead(40) == 1) || (digitalRead(41) == 1)) {
        Serial.println('!');
      } else {
        //leitura do sensor
        float valueECG = analogRead(A0);

        // Aplicar o filtro FIR
        //float filteredValue = applyFIRFilter(valueECG);

        // Formatar timestamp no estilo "YYYY-MM-DD HH:MM:SS"
        time_t rawTime = timestamp / 1000;
        struct tm* timeInfo = gmtime(&rawTime);
        char datetime[20];
        strftime(datetime, sizeof(datetime), "%Y-%m-%d %H:%M:%S", timeInfo);

        // Protege o acesso ao buffer
        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
          valueBuffer.push_back(valueECG);        // Adiciona valor ao buffer
          datetimeBuffer.push_back(String(datetime));  // Adiciona timestamp ao buffer
          xSemaphoreGive(dataMutex);
        }
      }
    }
    vTaskDelay(1);  // Evita o bloqueio da CPU
  }
}

void taskSendData(void* pvParameters) {
  while (true) {
    vTaskDelay(storageInterval / portTICK_PERIOD_MS);  // Aguarda o intervalo de envio

    // Protege o acesso ao buffer
    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      if (dataStorage.length() > 0) {
        Serial.println("Enviando dados...");
        sendData(valueBuffer, datetimeBuffer);

        // Limpa os buffers após o envio
        valueBuffer.clear();
        datetimeBuffer.clear();
      }
      xSemaphoreGive(dataMutex);
    }
  }
}

void sendData(const std::vector<float>& values, const std::vector<String>& datetimes) {

  //Serial.println(data);
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);

    // Cria documento JSON
    StaticJsonDocument<15000> jsonDocument;

    jsonDocument["patient_id"] = 13;  // ID do paciente
    JsonArray valueArray = jsonDocument["measurements"]["value"].to<JsonArray>();
    JsonArray datetimeArray = jsonDocument["measurements"]["datetime"].to<JsonArray>();

    // Preenche os arrays no JSON
    for (size_t i = 0; i < values.size(); ++i) {
      valueArray.add(values[i]);
      datetimeArray.add(datetimes[i]);
    }

    // Serializa o JSON para uma string
    String jsonString;
    serializeJson(jsonDocument, jsonString);

    // Envia os dados
    http.addHeader("Content-Type", "application/json");
    int responseCode = http.POST(jsonString);

    // Verifica a resposta HTTP
    if (responseCode == HTTP_CODE_OK) {  // 200 significa sucesso
      Serial.println("Dados enviados com sucesso!");
      Serial.println("Resposta do servidor: " + http.getString());
    } else {
      Serial.println("Falha ao enviar dados. Código de resposta: " + String(responseCode));
    }

    http.end();
  } else {
    Serial.println("WiFi não está conectado.");
  }
}

void loop() {
  // O loop principal não faz nada; as tarefas são executadas em paralelo
}
