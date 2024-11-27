#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

// Configurações da rede Wi-Fi
const char* ssid = "CLARO_2GEA41ED";
const char* password = "B8EA42ED";

// URL do WebSocket do servidor
const char* ws_server = "ws://localhost:8080";  // Substitua pelo IP do servidor

const int FIR_ORDER = 13;
float firCoefficients[FIR_ORDER] = {
    0.0001, 0.0005, 0.0020, 0.0050, 0.0100, 0.0200, 
    0.0300, 0.0400, 0.0300, 0.0200, 0.0100, 0.0050, 
    0.0001
};
float firBuffer[FIR_ORDER];

unsigned long lastSampleTime = 0;
const unsigned long sampleInterval = 2778; // 360Hz (2.78 ms)

WebsocketsClient client;

void setup() {
    Serial.begin(115200);

    pinMode(41, INPUT);
    pinMode(40, INPUT);

    // Conectar ao WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConectado ao WiFi");

    // Configurar o WebSocket
    client.onMessage([](WebsocketsMessage message) {
        Serial.print("Recebido do servidor: ");
        Serial.println(message.data());
    });

    // Conectar ao WebSocket
    client.connect(ws_server);

    // Inicializar buffer do filtro FIR
    for (int i = 0; i < FIR_ORDER; i++) {
        firBuffer[i] = 0.0;
    }
}

float applyFIRFilter(int input) {
    for (int i = FIR_ORDER - 1; i > 0; i--) {
        firBuffer[i] = firBuffer[i - 1];
    }
    firBuffer[0] = input;

    float output = 0.0;
    for (int i = 0; i < FIR_ORDER; i++) {
        output += firCoefficients[i] * firBuffer[i];
    }

    return output;
}

void publishECGData() {
    unsigned long currentTime = micros();
    if (currentTime - lastSampleTime >= sampleInterval) {
        lastSampleTime = currentTime;

        if ((digitalRead(40) == 1) || (digitalRead(41) == 1)) {
          Serial.println(".");
          
        }else{
          int ecgValue = analogRead(A0);
          float filteredValue = applyFIRFilter(ecgValue);

          Serial.println(filteredValue);
          String message = String(filteredValue, 6);
          client.send(message);
          Serial.print("Dado de ECG enviado: ");
          Serial.println(message);
        }
    }
}

void loop() {
    // Verificar se o cliente está conectado
    if (client.available()) {
        client.poll();
    }

    // Se o cliente não estiver mais conectado, reconectar
    if (!client.connect(ws_server)) {
        client.connect(ws_server);
    } else {
        publishECGData();
    }
}