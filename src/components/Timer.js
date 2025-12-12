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
  const distractionsRef = useRef(0); // dikkat dağınıklığı sayısı

  //
  // 1) Süre değişince timer sıfırlansın
  //
  useEffect(() => {
    setTime(duration);
    distractionsRef.current = 0;
  }, [duration]);

  //
  // 2) Reset sinyali gelince tamamen reset
  //
  useEffect(() => {
    setTime(duration);
    distractionsRef.current = 0;
  }, [resetSignal]);

  //
  // 3) Sayaç motoru
  //
  useEffect(() => {
    let interval = null;

    if (isRunning && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    }

    // Sayaç bitti → seans özeti dön
    if (time === 0 && isRunning) {
      if (onSessionEnd) {
        onSessionEnd({
          duration,
          category,
          distractions: distractionsRef.current,
        });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  //
  // 4) AppState ile dikkat dağınıklığı tespiti
  // background → distraction++
  // otomatik duraklatma → isRunning dışarıdan durdurulmalı
  //
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState === 'active' && nextState === 'background') {
        // Kullanıcı uygulamadan çıktı → dikkat dağınıklığı
        distractionsRef.current += 1;

        // Timer çalışıyorsa uyarı göster (UI kontrolü HomeScreen’de)
        Alert.alert(
          'Dikkat Dağıldı',
          'Uygulamadan çıktın. Zamanlayıcı duraklatıldı.'
        );
      }

      if (appState === 'background' && nextState === 'active') {
        // Kullanıcı geri döndü
        Alert.alert(
          'Devam?',
          'Odaklanma seansına kaldığın yerden devam etmek ister misin?'
        );
      }

      setAppState(nextState);
    });

    return () => subscription.remove();
  }, [appState]);

  //
  // 5) Formatlama
  //
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  //
  // 6) UI
  //
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
  container: { alignItems: 'center', marginVertical: 20 },
  time: { fontSize: 48, fontWeight: 'bold', marginVertical: 10 },
  category: { fontSize: 18, marginTop: 5 },
});
