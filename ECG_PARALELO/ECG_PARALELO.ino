#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>

// Credenciais do WiFi
const char* ssid = "WP3-CETELI-2-IA";
const char* password = "RioNhamunda";

// URL do servidor Apache
const char* serverURL = "http://10.224.1.149/ESP32/index.php";

const unsigned long sampleInterval = 2.78;  // Intervalo de amostragem para 360Hz (2.78 ms)
const unsigned long storageInterval = 4440; // Tempo de armazenamento em milissegundos (4.44 segundos)

String dataStorage = "";  // Buffer para armazenar os dados
unsigned long lastSampleTime = 0;

// Semáforo para sincronização
SemaphoreHandle_t dataMutex;

// Cliente NTP
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000); // Atualiza a cada 60 segundos

const int FIR_ORDER = 17; // Ordem do filtro FIR (número de coeficientes)
float firCoefficients[FIR_ORDER] = {
    // Coeficientes calculados para rejeitar baixas e altas frequências
    -0.0025, -0.0060, -0.0115, -0.0096, 0.0156, 0.0728, 0.1512, 
    0.2207, 0.2486, 0.2207, 0.1512, 0.0728, 0.0156, -0.0096, 
    -0.0115, -0.0060, -0.0025
};
float firBuffer[FIR_ORDER];  // Inicializa o buffer com zeros
float buffer[FIR_ORDER] = {0.0};

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

  // Inicializa semáforo
  dataMutex = xSemaphoreCreateMutex();

  // Inicia tarefas
  xTaskCreatePinnedToCore(taskReadData, "ReadData", 4096, NULL, 1, NULL, 0); // Núcleo 0
  xTaskCreatePinnedToCore(taskSendData, "SendData", 4096, NULL, 1, NULL, 1); // Núcleo 1

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
    return output;;
}

void taskReadData(void* pvParameters) {
  // Sincroniza o início com o tempo NTP
  timeClient.update();
  unsigned long baseTimeMillis = timeClient.getEpochTime() * 1000; // Hora em milissegundos
  unsigned long startTime = millis(); // Marca o tempo inicial relativo ao ESP32

  while (true) {
    unsigned long currentTime = millis();
    if (currentTime - lastSampleTime >= sampleInterval) {
      // Captura dados do sensor
      unsigned long elapsedMillis = currentTime - startTime; // Tempo decorrido desde a base de tempo
      unsigned long timestamp = baseTimeMillis + elapsedMillis; // Hora atual em milissegundos

      lastSampleTime = currentTime; // Atualiza o último tempo de amostragem

      if ((digitalRead(40) == 1) || (digitalRead(41) == 1)) {
        Serial.println('!');
      }else{
      //leitura do sensor
      int valueECG = analogRead(A0); 

      // Aplicar o filtro FIR
      float filteredValue = applyFIRFilter(valueECG);

      // Protege o acesso ao buffer
      if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
        dataStorage += String(timestamp) + "," + String(filteredValue) + "\n";
        xSemaphoreGive(dataMutex);
      }
      // Tamanho da string em caracteres
        size_t length = dataStorage.length();  // Número de caracteres

        // Tamanho em bytes da string
        size_t bytesUsed = dataStorage.length() * sizeof(char);

        // Imprime o tamanho da string
        Serial.print("Tamanho da string (caracteres): ");
        Serial.print(length);
        Serial.print(" caracteres, ");
        Serial.print("Tamanho da string (bytes): ");
        Serial.println(bytesUsed);

        // Se quiser ver também a memória livre
        //size_t freeHeap = ESP.getFreeHeap();  // Memória livre
        //size_t totalHeap = ESP.getHeapSize(); // Tamanho total do heap
        //size_t usedMemory = totalHeap - freeHeap; // Memória usada
        //Serial.print("Memória usada: ");
        //Serial.print(usedMemory);
        //Serial.print(" bytes, Memória livre: ");
        //Serial.println(freeHeap);
      }
    }
    vTaskDelay(1); // Evita o bloqueio da CPU
  }
}

void taskSendData(void* pvParameters) {
  while (true) {
    vTaskDelay(storageInterval / portTICK_PERIOD_MS); // Aguarda o intervalo de envio

    // Protege o acesso ao buffer
    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      if (dataStorage.length() > 0) {
        Serial.println("Enviando dados...");
        sendData(dataStorage);
        dataStorage = ""; // Limpa o buffer após o envio
      }
      xSemaphoreGive(dataMutex);
    }
  }
}

void sendData(String& data) {

  //Serial.println(data);
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);

    // Cria documento JSON
    StaticJsonDocument<13000> jsonDocument;
  
    // Verifica se dataStorage não está vazio antes de adicionar ao JSON
    if (dataStorage.length() > 0) {
      jsonDocument["dados"] = data;
      Serial.println("dataStorage não está vazio! Dados serão enviados.");
    } else {
      Serial.println("dataStorage está vazio! Nenhum dado será enviado.");
      return; // Sai da função se não houver dados para enviar
    }

    // Serializa o JSON para uma string
    String jsonString;
    if (serializeJson(jsonDocument, jsonString) == 0) {
      Serial.println("Erro ao serializar o JSON.");  // Mensagem de erro se a serialização falhar
      return;
    } else {
      Serial.println("JSON serializado com sucesso.");
    }

    if (jsonString.length() == 0) {
      Serial.println("Erro: JSON está vazio após serialização.");
      return;
    }else {
      Serial.println("JSON preenchido com sucesso.");
    }

    // Imprime o JSON gerado para verificação
    Serial.println("JSON enviado: " + jsonString);
    
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
