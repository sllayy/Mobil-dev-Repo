import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, View } from 'react-native';

export default function Timer({
  duration,
  category,
  isRunning,
  resetSignal,
  onSessionEnd,
}) {
  const [time, setTime] = useState(duration);
  const [appState, setAppState] = useState(AppState.currentState);
  const distractionsRef = useRef(0);

  //------------------------------
  // 1) Süre değiştiğinde sıfırla
  //------------------------------
  useEffect(() => {
    setTime(duration);
    distractionsRef.current = 0;
  }, [duration]);

  //------------------------------
  // 2) Reset tetiklenince sıfırla
  //------------------------------
  useEffect(() => {
    setTime(duration);
    distractionsRef.current = 0;
  }, [resetSignal]);

  //------------------------------
  // 3) Sayaç motoru
  //------------------------------
  useEffect(() => {
    let interval = null;

    // Sayaç çalışırken her saniye azalt
    if (isRunning && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    }

    // Sayaç bitti → HomeScreen’e sonuç gönder
    if (time === 0 && isRunning) {
      onSessionEnd?.({
        duration,
        category,
        distractions: distractionsRef.current,
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  //------------------------------
  // 4) AppState — dikkat dağınıklığı takibi
  //------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      // AKTİF → ARKA PLAN
      if (appState === "active" && nextState === "background") {
        if (isRunning) {
          distractionsRef.current += 1;      // Dikkat dağınıklığı++
          onSessionEnd?.({                   // Timer'ı bitirmeden duraklat
            duration: time,                  // kalan süre
            category,
            distractions: distractionsRef.current,
          });
          Alert.alert(
            "Dikkat Dağıldı",
            "Uygulamadan çıktığın için zamanlayıcı durduruldu."
          );
        }
      }

      // ARKA PLAN → AKTİF (geri dönüş)
      if (appState === "background" && nextState === "active") {
        if (isRunning) {
          Alert.alert(
            "Devam Etmek İster misin?",
            "Kaldığın yerden devam edebilirsin.",
            [
              { text: "Tamam", onPress: () => {} },
            ]
          );
        }
      }

      setAppState(nextState);
    });

    return () => subscription.remove();
  }, [appState, isRunning, time]);

  //------------------------------
  // 5) Süre formatlama
  //------------------------------
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  //------------------------------
  // 6) UI
  //------------------------------
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
