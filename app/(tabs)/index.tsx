import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Timer from '../../src/components/Timer';

export default function HomeScreen() {
  const [category, setCategory] = useState('Ders');
  const [duration, setDuration] = useState(25 * 60);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Zamanlayıcı</Text>

      <Text style={styles.label}>Süre Seç (Dakika)</Text>
      <Picker
        selectedValue={duration}
        onValueChange={(v) => setDuration(v)}
        style={styles.picker}
      >
        <Picker.Item label="5 dakika" value={5 * 60} />
        <Picker.Item label="15 dakika" value={15 * 60} />
        <Picker.Item label="25 dakika" value={25 * 60} />
        <Picker.Item label="45 dakika" value={45 * 60} />
        <Picker.Item label="60 dakika" value={60 * 60} />
      </Picker>

      <Text style={styles.label}>Kategori</Text>
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
  container: { flex: 1, padding: 20, marginTop: 50 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  picker: { height: 50, width: '100%' },
});
