import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Timer({ duration }) {
  const [time, setTime] = useState(duration);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval = null;

    if (running && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    }

    return () => clearInterval(interval);
  }, [running, time]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(time)}</Text>

      <Button title={running ? 'Duraklat' : 'Başlat'} onPress={() => setRunning(!running)} />
      <Button title="Sıfırla" onPress={() => { setRunning(false); setTime(duration); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10 },
  time: { fontSize: 48, fontWeight: 'bold', marginVertical: 20 },
});
