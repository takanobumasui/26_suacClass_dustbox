// HC-SR04超音波距離センサーで距離(cm)を測り、1行ずつSerialに出力する。
// 配線: VCC->5V, GND->GND, Trig->TRIG_PIN, Echo->ECHO_PIN

const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const unsigned long MEASURE_INTERVAL_MS = 500;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // 30ms(約5m)でタイムアウト。反射が返ってこない=障害物なしの場合は0が返る。
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    Serial.println("NaN");
  } else {
    float distanceCm = duration * 0.0343 / 2.0;
    Serial.println(distanceCm, 1);
  }

  delay(MEASURE_INTERVAL_MS);
}
