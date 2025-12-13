// @ts-nocheck
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Timer from "../components/Timer";
import { saveSession } from "../storage/sessions";

export default function HomeScreen() {
  const [category, setCategory] = useState("Ders");
  const [duration, setDuration] = useState(25 * 60);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // ← EKLENDİ
  const [resetSignal, setResetSignal] = useState(false);

  const [summary, setSummary] = useState(null);

  // Timer bittiğinde çalışır
  const handleSessionEnd = async (session) => {
    setIsRunning(false);
    setIsPaused(false);
    setSummary(session);
    await saveSession(session);
  };

  // AppState → background olunca Timer burayı çağırıyor
  const handleForcePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  // Kullanıcı "Bitir" derse
  const finishSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSummary({
      duration,
      category,
      distractions: 0,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Zamanlayıcı</Text>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Süre Seç</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={duration}
            onValueChange={(v) => {
              setDuration(v);
              setSummary(null);
            }}
            enabled={!isRunning && !isPaused}
            style={styles.picker}
          >
            <Picker.Item label="5 dakika" value={5 * 60} />
            <Picker.Item label="15 dakika" value={15 * 60} />
            <Picker.Item label="25 dakika" value={25 * 60} />
            <Picker.Item label="45 dakika" value={45 * 60} />
            <Picker.Item label="60 dakika" value={60 * 60} />
          </Picker>
        </View>

        <Text style={styles.label}>Kategori</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={category}
            onValueChange={(v) => {
              setCategory(v);
              setSummary(null);
            }}
            enabled={!isRunning && !isPaused}
            style={styles.picker}
          >
            <Picker.Item label="Ders" value="Ders" />
            <Picker.Item label="Kodlama" value="Kodlama" />
            <Picker.Item label="Proje" value="Proje" />
            <Picker.Item label="Kitap" value="Kitap" />
          </Picker>
        </View>
      </View>

      {/* TIMER */}
      <Timer
        duration={duration}
        category={category}
        isRunning={isRunning}
        resetSignal={resetSignal}
        onSessionEnd={handleSessionEnd}
        onForcePause={handleForcePause}
      />

      {/* BUTTON LOGIC */}

      {/* 1️⃣ BAŞLAMADAN ÖNCE */}
      {!isRunning && !isPaused && (
        <Pressable
          style={[styles.btn, styles.btnStart]}
          onPress={() => setIsRunning(true)}
        >
          <Text style={styles.btnText}>Başlat</Text>
        </Pressable>
      )}

      {/* 2️⃣ ÇALIŞIRKEN */}
      {isRunning && (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.btn, styles.btnPause]}
            onPress={() => {
              setIsRunning(false);
              setIsPaused(true);
            }}
          >
            <Text style={styles.btnText}>Duraklat</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.btnFinish]}
            onPress={finishSession}
          >
            <Text style={styles.btnText}>Bitir</Text>
          </Pressable>
        </View>
      )}

      {/* 3️⃣ DURAKLATILDIĞINDA */}
      {!isRunning && isPaused && (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.btn, styles.btnStart]}
            onPress={() => {
              setIsRunning(true);
              setIsPaused(false);
            }}
          >
            <Text style={styles.btnText}>Devam Et</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.btnFinish]}
            onPress={finishSession}
          >
            <Text style={styles.btnText}>Bitir</Text>
          </Pressable>
        </View>
      )}

      {/* SIFIRLA */}
      <Pressable
        style={[styles.btn, styles.btnReset]}
        onPress={() => {
          setIsRunning(false);
          setIsPaused(false);
          setSummary(null);
          setResetSignal((prev) => !prev);
        }}
      >
        <Text style={styles.btnText}>Sıfırla</Text>
      </Pressable>

      {/* SUMMARY */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Seans Özeti</Text>
        {summary ? (
          <>
            <Text style={styles.summaryItem}>
              Süre: {summary.duration / 60} dk
            </Text>
            <Text style={styles.summaryItem}>Kategori: {summary.category}</Text>
            <Text style={styles.summaryItem}>
              Dikkat Dağınıklığı: {summary.distractions}
            </Text>
          </>
        ) : (
          <Text style={styles.noSummary}>Henüz tamamlanmış seans yok.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  pickerWrapper: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 12,
  },
  picker: { height: 45, width: "100%" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  btnStart: { backgroundColor: "#4CAF50" },
  btnPause: { backgroundColor: "#ff9800" },
  btnFinish: { backgroundColor: "#1976D2" },
  btnReset: { backgroundColor: "#e53935", marginTop: 10 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 20,
  },
  summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  summaryItem: { fontSize: 15, marginVertical: 3 },
  noSummary: { fontSize: 14, color: "#777" },
});
