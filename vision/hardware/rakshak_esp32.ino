/*
  rakshak_esp32.ino
  ─────────────────────────────────────────────────────────────────────────────
  Rakshak AI — Arduino Nano ESP32 Firmware
  Hardware trigger layer for the Rakshak AI Vision Module.

  Circuit (matches KiCad schematic rakshakAI.kicad_sch):
  ┌─────────────────┬──────────────────────────────────────────────┐
  │ Component       │ Arduino Nano ESP32 Pin                       │
  ├─────────────────┼──────────────────────────────────────────────┤
  │ PIR Sensor OUT  │ D2   (digital interrupt, INPUT)              │
  │ Green LED       │ D5   (LED_READY  — system waiting)           │
  │ Yellow LED      │ D6   (LED_CAMERA — camera / processing)      │
  │ Red LED         │ D7   (LED_ALERT  — threat detected by AI)    │
  │ Buzzer          │ D8   (active buzzer, HIGH = on)              │
  │ OLED SDA        │ A4 / SDA  (I2C data)                         │
  │ OLED SCL        │ A5 / SCL  (I2C clock)                        │
  │ All resistors   │ 220 Ω on each LED leg (R1, R2, R3)           │
  └─────────────────┴──────────────────────────────────────────────┘

  All LEDs share a common GND rail.
  Buzzer pin 1 = GND, pin 2 = D8 (active buzzer needs HIGH to sound).

  Behaviour:
  ┌─────────────────┬──────────────────────────────────────────────┐
  │ State           │ Hardware output                              │
  ├─────────────────┼──────────────────────────────────────────────┤
  │ WAITING (idle)  │ Green LED on, Yellow/Red off, Buzzer off     │
  │ PIR fires       │ Yellow LED on, Green off → POST /sensor-     │
  │                 │ trigger to Vision Module via WiFi            │
  │ API confirms    │ Yellow LED blinks 3× to confirm              │
  │ Threat detected │ Red LED on + Buzzer on for BUZZ_DURATION ms  │
  │ Back to idle    │ Green LED on again                           │
  └─────────────────┴──────────────────────────────────────────────┘

  OLED shows:
  - Line 1: "Rakshak AI"
  - Line 2: System state (WAITING / ACTIVE / ALERT)
  - Line 3: Last event (sensor ID + timestamp)
  - Line 4: WiFi IP address

  Modify WIFI_SSID, WIFI_PASSWORD, and VISION_API_URL before flashing.

  Dependencies (install via Arduino Library Manager):
    - Adafruit SSD1306
    - Adafruit GFX Library
    - ArduinoJson  (v7)
    - WiFi  (built into Arduino ESP32 board package)
    - HTTPClient (built into Arduino ESP32 board package)

  TETRA036 | Member 1 — Vision Engineer
*/

// ─── Board / library includes ────────────────────────────────────────────────
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─── WiFi credentials ────────────────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ─── Vision Module API ───────────────────────────────────────────────────────
// Change this to the IP / hostname where `uvicorn app:app` is running.
// Example: "http://192.168.1.42:8000/sensor-trigger"
const char* VISION_API_URL = "http://192.168.1.100:8000/sensor-trigger";

// ─── Pin definitions (match KiCad schematic exactly) ─────────────────────────
const int PIN_PIR         = 2;   // D2  — PIR_OUT (J1)
const int PIN_LED_READY   = 5;   // D5  — GREEN  LED (D1, R1 220Ω)
const int PIN_LED_CAMERA  = 6;   // D6  — YELLOW LED (D2, R2 220Ω)
const int PIN_LED_ALERT   = 7;   // D7  — RED    LED (D3, R3 220Ω)
const int PIN_BUZZER      = 8;   // D8  — BZ1 BUZZER

// ─── OLED display (SSD1306 128×64 via I2C) ───────────────────────────────────
#define SCREEN_WIDTH   128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1   // not used — share Arduino reset
#define OLED_I2C_ADDR 0x3C   // most SSD1306 modules use 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ─── Timing constants ────────────────────────────────────────────────────────
const unsigned long DEBOUNCE_MS   =  2000;  // ignore re-triggers for 2 s
const unsigned long BUZZ_DURATION =  1500;  // buzzer on for 1.5 s on alert
const unsigned long BLINK_MS      =   200;  // LED blink period

// ─── State ───────────────────────────────────────────────────────────────────
volatile bool     pirFired       = false;
unsigned long     lastTriggerMs  = 0;
String            currentState   = "WAITING";
String            lastEvent      = "none";
int               eventCount     = 0;

// ─── ISR — called by hardware on PIR rising edge ─────────────────────────────
void IRAM_ATTR onPirMotion() {
  pirFired = true;
}

// ─────────────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial.println("[Rakshak AI] Booting...");

  // Pin setup
  pinMode(PIN_PIR,        INPUT);
  pinMode(PIN_LED_READY,  OUTPUT);
  pinMode(PIN_LED_CAMERA, OUTPUT);
  pinMode(PIN_LED_ALERT,  OUTPUT);
  pinMode(PIN_BUZZER,     OUTPUT);

  // Boot state: only green on
  setLeds(HIGH, LOW, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  // OLED init
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDR)) {
    Serial.println("[OLED] Init failed — check wiring (SDA=A4, SCL=A5).");
  } else {
    oledShow("Rakshak AI", "Booting...", "", "");
  }

  // Connect to WiFi
  oledShow("Rakshak AI", "WiFi...", WIFI_SSID, "");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 30) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected: " + WiFi.localIP().toString());
    oledShow("Rakshak AI", "WAITING", "WiFi OK", WiFi.localIP().toString());
  } else {
    Serial.println("\n[WiFi] FAILED — running offline (trigger will be logged only).");
    oledShow("Rakshak AI", "WAITING", "No WiFi", "");
  }

  // Attach PIR interrupt on rising edge (motion detected)
  attachInterrupt(digitalPinToInterrupt(PIN_PIR), onPirMotion, RISING);

  Serial.println("[Rakshak AI] Ready. Waiting for motion.");
}

// ─────────────────────────────────────────────────────────────────────────────
void loop() {

  // ── PIR fired? ─────────────────────────────────────────────────────────────
  if (pirFired) {
    pirFired = false;  // clear flag immediately

    unsigned long now = millis();

    // Debounce — ignore if we triggered very recently
    if (now - lastTriggerMs < DEBOUNCE_MS) {
      Serial.println("[PIR] Debounced — ignoring.");
      return;
    }
    lastTriggerMs = now;
    eventCount++;

    Serial.printf("[PIR] Motion detected! Event #%d\n", eventCount);

    // ── Switch to CAMERA state visually ──────────────────────────────────────
    currentState = "ACTIVE";
    setLeds(LOW, HIGH, LOW);   // yellow on, green off
    oledShow("Rakshak AI", "MOTION!", "Camera ON", "Event #" + String(eventCount));

    // ── POST trigger to Vision Module ─────────────────────────────────────────
    bool apiOk = postTrigger("north_boundary");

    if (apiOk) {
      // Blink yellow 3× to confirm API acknowledged
      blinkLed(PIN_LED_CAMERA, 3, BLINK_MS);
      currentState = "PROCESSING";
      lastEvent    = "PIR @ " + String(now / 1000) + "s";
      oledShow("Rakshak AI", "PROCESSING", lastEvent, "AI running...");
      Serial.println("[API] Trigger confirmed by Vision Module.");
    } else {
      // API unreachable — show warning, fall back to green
      Serial.println("[API] Trigger failed — Vision Module unreachable.");
      oledShow("Rakshak AI", "API ERROR", "No response", "Check server");
      delay(2000);
    }

    // ── Return to WAITING ─────────────────────────────────────────────────────
    currentState = "WAITING";
    setLeds(HIGH, LOW, LOW);   // green on
    oledShow("Rakshak AI", "WAITING", lastEvent, WiFi.localIP().toString());
  }

  // Normal idle — green LED on, everything else off.
  // (No need to keep calling digitalWrite here — LEDs hold state.)
}

// ─────────────────────────────────────────────────────────────────────────────
// postTrigger — send motion event JSON to Vision Module
// Returns true if the server replied with HTTP 200.
// ─────────────────────────────────────────────────────────────────────────────
bool postTrigger(const String& location) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] Not connected to WiFi.");
    return false;
  }

  HTTPClient http;
  http.begin(VISION_API_URL);
  http.addHeader("Content-Type", "application/json");

  // Build JSON payload — hardware format
  // {"event":"motion_detected","sensor":"PIR","location":"...","timestamp":"..."}
  StaticJsonDocument<256> doc;
  doc["event"]     = "motion_detected";
  doc["sensor"]    = "PIR";
  doc["location"]  = location;
  doc["timestamp"] = String(millis() / 1000) + "s uptime";

  String body;
  serializeJson(doc, body);

  Serial.println("[API] POST " + String(VISION_API_URL));
  Serial.println("[API] Body: " + body);

  int httpCode = http.POST(body);
  http.end();

  if (httpCode == 200) {
    return true;
  }

  Serial.printf("[API] HTTP %d\n", httpCode);
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// alertSequence — red LED + buzzer when threat is detected
// Call this if you poll /trigger-status and see a threat result.
// ─────────────────────────────────────────────────────────────────────────────
void alertSequence() {
  setLeds(LOW, LOW, HIGH);         // red on
  digitalWrite(PIN_BUZZER, HIGH);  // buzzer on
  delay(BUZZ_DURATION);
  digitalWrite(PIN_BUZZER, LOW);   // buzzer off
  setLeds(HIGH, LOW, LOW);         // back to green
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

void setLeds(int ready, int camera, int alert) {
  digitalWrite(PIN_LED_READY,  ready);
  digitalWrite(PIN_LED_CAMERA, camera);
  digitalWrite(PIN_LED_ALERT,  alert);
}

void blinkLed(int pin, int times, unsigned long period) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(period);
    digitalWrite(pin, LOW);
    delay(period);
  }
}

void oledShow(const String& l1, const String& l2,
              const String& l3, const String& l4) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0,  0); display.println(l1);
  display.setCursor(0, 16); display.println(l2);
  display.setCursor(0, 32); display.println(l3);
  display.setCursor(0, 48); display.println(l4);

  display.display();
}
