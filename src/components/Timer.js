import { useEffect, useRef, useState } from "react";
import { Alert, AppState, StyleSheet, Text, View } from "react-native";

export default function Timer({
  duration,
  category,
  isRunning,
  resetSignal,
  onSessionEnd,
  onForcePause, // HomeScreen tarafında zorunlu durdurma
}) {
  const [time, setTime] = useState(duration);

  const distractionsRef = useRef(0);

  // ❗ FIX: AppState react state değil REF olmalı
  const appStateRef = useRef(AppState.currentState);

  // ------------------------------
  // 1) Süre değiştiğinde sıfırla
  // ------------------------------
  useEffect(() => {
    setTime(duration);
    distractionsRef.current = 0;
  }, [duration]);

  // ------------------------------
  // 2) Reset tetiklenince sıfırla
  // ------------------------------
  useEffect(() => {
    setTime(duration);
    distractionsRef.current = 0;
  }, [resetSignal]);

  // ------------------------------
  // 3) Sayaç motoru
  // ------------------------------
  useEffect(() => {
    let interval = null;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((t) => t - 1);
      }, 1000);
    }

    // ❗ FIX: sayaç 0’a düştüğü AN tetiklenmeli
    if (isRunning && time === 0) {
      onSessionEnd?.({
        duration,
        category,
        distractions: distractionsRef.current,
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  // ------------------------------
  // 4) AppState — dikkat dağınıklığı tespiti (FIX'li versiyon)
  // ------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      const prev = appStateRef.current;

      // ACTIVE → BACKGROUND → +1 dikkat dağınıklığı
      if (prev === "active" && nextState === "background") {
        if (isRunning) {
          distractionsRef.current += 1;

          Alert.alert(
            "Dikkatin Dağıldı",
            "Uygulamadan çıktığın için zamanlayıcı durduruldu."
          );

          onForcePause?.();
        }
      }

      // BACKGROUND → ACTIVE (geri dönüş)
      if (prev === "background" && nextState === "active") {
        Alert.alert(
          "Devam Et?",
          "Seansa kaldığın yerden devam etmek ister misin?",
          [{ text: "Tamam" }]
        );
      }

      // ❗ FIX: state daima güncellenmeli
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [isRunning]);

  // ------------------------------
  // 5) Format
  // ------------------------------
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(time)}</Text>
      <Text style={styles.category}>Kategori: {category}</Text>
      <Text style={styles.category}>
        Dikkat Dağınıklığı: {distractionsRef.current}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: 20 },
  time: { fontSize: 48, fontWeight: "bold", marginVertical: 10 },
  category: { fontSize: 18, marginTop: 5 },
});
