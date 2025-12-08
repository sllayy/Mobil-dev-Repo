import { useState } from 'react';
import { Picker, StyleSheet, Text, View } from 'react-native';
import Timer from '../components/Timer';

export default function HomeScreen() {
  const [category, setCategory] = useState('Ders');
  const [duration, setDuration] = useState(25 * 60); // 25 dakika

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Zamanlayıcı</Text>

      {/* Kategori seçimi */}
      <Picker
        selectedValue={category}
        onValueChange={(v) => setCategory(v)}
        style={styles.picker}
      >
        <Picker.Item label="Ders" value="Ders" />
        <Picker.Item label="Kodlama" value="Kodlama" />
        <Picker.Item label="Proje" value="Proje" />
        <Picker.Item label="Kitap" value="Kitap" />
      </Picker>

      <Timer duration={duration} category={category} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  picker: { height: 50, width: '100%' },
});
