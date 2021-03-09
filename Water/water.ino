void setup() {
  Serial.begin(9600); //Connect to serial port with rate of 9600bps.
  delay(1000);
}

void loop() {
  int value = analogRead(A0); //Read the value from temperature sensor
  int tempC = value*0.48828125;
  int a=50;//Convert it into temp in C.
  String reading;
  reading+=tempC;
  reading+=" ";
  reading+=a;
  Serial.println(reading);  //Print it on Serial Monitor.
  delay(1000); //Delay, specifies gap between two readings in miliseconds.
}
