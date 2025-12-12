// @ts-nocheck
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Timer from '../components/Timer';

export default function HomeScreen() {
  const [category, setCategory] = useState('Ders');
  const [duration, setDuration] = useState(25 * 60); // saniye
  const [isRunning, setIsRunning] = useState(false);
  const [resetSignal, setResetSignal] = useState(false);

  // seans özet bilgisi
  const [summary, setSummary] = useState(null);

  const handleSessionEnd = (session) => {
    // seans bittiğinde timer tarafından gönderilen özet
    setIsRunning(false);
    setSummary(session);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Zamanlayıcı</Text>

      {/* SÜRE SEÇİMİ */}
      <Text style={styles.label}>Süre Seç (Dakika)</Text>
      <Picker
        selectedValue={duration}
        onValueChange={(value) => {
          setDuration(value);
          setSummary(null); // yeni süre seçildiğinde önceki özet silinsin
        }}
        enabled={!isRunning}
        style={styles.picker}
      >
        <Picker.Item label="5 dakika" value={5 * 60} />
        <Picker.Item label="15 dakika" value={15 * 60} />
        <Picker.Item label="25 dakika" value={25 * 60} />
        <Picker.Item label="45 dakika" value={45 * 60} />
        <Picker.Item label="60 dakika" value={60 * 60} />
      </Picker>

      {/* KATEGORİ SEÇİMİ */}
      <Text style={styles.label}>Kategori</Text>
      <Picker
        selectedValue={category}
        onValueChange={(value) => {
          setCategory(value);
          setSummary(null);
        }}
        enabled={!isRunning}
        style={styles.picker}
      >
        <Picker.Item label="Ders" value="Ders" />
        <Picker.Item label="Kodlama" value="Kodlama" />
        <Picker.Item label="Proje" value="Proje" />
        <Picker.Item label="Kitap" value="Kitap" />
      </Picker>

      {/* TIMER */}
      <Timer
        duration={duration}
        category={category}
        isRunning={isRunning}
        resetSignal={resetSignal}
        onSessionEnd={handleSessionEnd} // seans bittiğinde özet buraya gelecek
      />

      {/* BUTONLAR */}
      <View style={styles.buttonRow}>
        <Button title="Başlat" onPress={() => setIsRunning(true)} />
        <Button title="Duraklat" onPress={() => setIsRunning(false)} />
        <Button
          title="Sıfırla"
          onPress={() => {
            setIsRunning(false);
            setSummary(null);
            setResetSignal((prev) => !prev); // timer'a reset sinyali gönder
          }}
        />
      </View>

      {/* SEANS ÖZETİ */}
      <View style={{ marginTop: 30 }}>
        <Text style={styles.summaryTitle}>Seans Özeti</Text>

        {summary ? (
          <>
            <Text>Süre: {summary.duration / 60} dakika</Text>
            <Text>Kategori: {summary.category}</Text>
            <Text>Dikkat Dağınıklığı: {summary.distractions}</Text>
          </>
        ) : (
          <Text>Henüz tamamlanmış bir seans yok.</Text>
        )}
      </View>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  picker: { height: 50, width: '100%' },
  buttonRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
});
