// @ts-nocheck
import { Picker } from "@react-native-picker/picker";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Timer from "../components/Timer";
import { saveSession } from "../storage/sessions";

/* -----------------------------------
   SABİT VERİLER
----------------------------------- */
const DURATIONS = [
  { label: "5 dakika", value: 5 * 60 },
  { label: "15 dakika", value: 15 * 60 },
  { label: "25 dakika", value: 25 * 60 },
  { label: "45 dakika", value: 45 * 60 },
  { label: "60 dakika", value: 60 * 60 },
];

const CATEGORIES = ["Ders", "Kodlama", "Proje", "Kitap"];

/* -----------------------------------
   COMPONENT
----------------------------------- */
export default function HomeScreen() {
  const [duration, setDuration] = useState(25 * 60);
  const [category, setCategory] = useState("Ders");

  // ✅ Ekranda gördüğümüz kalan süre kaynağı
  const [remainingTime, setRemainingTime] = useState(25 * 60);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [resetSignal, setResetSignal] = useState(false);

  const [distractions, setDistractions] = useState(0);

  // iOS modal state
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [tmpDuration, setTmpDuration] = useState(duration);
  const [tmpCategory, setTmpCategory] = useState(category);

  const appState = useRef(AppState.currentState);

  const selectionLocked = isRunning || isPaused;

  const durationLabel = useMemo(() => {
    return DURATIONS.find((d) => d.value === duration)?.label ?? "Seç";
  }, [duration]);

  /* -----------------------------------
     DURATION değişince kalan süreyi eşitle
  ----------------------------------- */
  useEffect(() => {
    setRemainingTime(duration);
  }, [duration]);

  /* -----------------------------------
     Reset gelince kalan süreyi eşitle
  ----------------------------------- */
  useEffect(() => {
    setRemainingTime(duration);
  }, [resetSignal, duration]);

  /* -----------------------------------
     Bildirim izni (tek sefer)
  ----------------------------------- */
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  /* -----------------------------------
     AppState — dikkat dağınıklığı sayımı
     (iOS modal açıkken sayma)
     Not: "geri dönüş" anında sayıyoruz.
  ----------------------------------- */
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const prevState = appState.current;

      // iOS picker açıkken tetiklenmesin
      if (showDurationModal || showCategoryModal) {
        appState.current = nextState;
        return;
      }

      // ✅ background → active = dikkat dağınıklığı
      if (prevState === "background" && nextState === "active" && isRunning) {
        // 1️⃣ SAY
        setDistractions((prev) => prev + 1);

        // 2️⃣ TİTREŞİM
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        } catch {}

        // 3️⃣ POPUP (UI)
        Alert.alert(
          "Dikkatin dağıldı",
          "Uygulamadan çıktınız.\nLütfen odaklanmaya devam ediniz.",
          [{ text: "Tamam", style: "default" }],
          { cancelable: false }
        );

        // 4️⃣ BİLDİRİM (arka planda da görünür)
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Dikkatin dağıldı 👀",
              body: "Uygulamadan çıktığınız için seans duraklatıldı.",
            },
            trigger: null,
          });
        } catch {}

        // 5️⃣ SEANSI DURAKLAT
        setIsRunning(false);
        setIsPaused(true);
      }

      appState.current = nextState;
    });

    return () => sub.remove();
  }, [isRunning, showDurationModal, showCategoryModal]);

  /* -----------------------------------
     SEANS TAM BİTİNCE (Timer time==0)
     ✅ gerçek çalışılan saniyeyi kaydet
  ----------------------------------- */
  const handleSessionEnd = async (session) => {
    setIsRunning(false);
    setIsPaused(false);

    // Timer gönderirse onu kullan, göndermezse bizim state'ten al
    const left = session?.remainingTime ?? remainingTime;

    const workedSeconds = Math.max(0, session.duration - left);

    if (workedSeconds > 0) {
      await saveSession({
        duration: workedSeconds,
        category: session.category,
        distractions,
      });
    }

    // reset
    setDistractions(0);
    setRemainingTime(duration);
  };

  /* -----------------------------------
     BITIR (erken bitirme)
     ✅ gerçek çalışılan saniyeyi kaydet
  ----------------------------------- */
  const finishSession = async () => {
    setIsRunning(false);
    setIsPaused(false);

    const workedSeconds = Math.max(0, duration - remainingTime);

    if (workedSeconds > 0) {
      await saveSession({
        duration: workedSeconds,
        category,
        distractions,
      });
    }

    setDistractions(0);
    setRemainingTime(duration);
  };

  /* -----------------------------------
     UI
  ----------------------------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odaklanma Zamanlayıcı</Text>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Süre Seç</Text>

        {/* ANDROID */}
        {Platform.OS === "android" ? (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={duration}
              onValueChange={(v) => setDuration(v)}
              enabled={!selectionLocked}
              style={styles.pickerAndroid}
              mode="dropdown"
              dropdownIconColor="#111"
            >
              {DURATIONS.map((d) => (
                <Picker.Item key={d.value} label={d.label} value={d.value} />
              ))}
            </Picker>
          </View>
        ) : (
          <>
            <Pressable
              style={[
                styles.selectBox,
                selectionLocked && styles.selectBoxDisabled,
              ]}
              onPress={() => {
                setTmpDuration(duration);
                setShowDurationModal(true);
              }}
              disabled={selectionLocked}
            >
              <Text style={styles.selectText}>{durationLabel}</Text>
            </Pressable>

            <Modal
              transparent
              animationType="slide"
              visible={showDurationModal}
              onRequestClose={() => setShowDurationModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                  <View style={styles.modalHeader}>
                    <Pressable onPress={() => setShowDurationModal(false)}>
                      <Text style={styles.modalBtn}>İptal</Text>
                    </Pressable>

                    <Text style={styles.modalTitle}>Süre Seç</Text>

                    <Pressable
                      onPress={() => {
                        setDuration(tmpDuration);
                        setShowDurationModal(false);
                      }}
                    >
                      <Text style={[styles.modalBtn, styles.modalBtnDone]}>
                        Tamam
                      </Text>
                    </Pressable>
                  </View>

                  <Picker
                    selectedValue={tmpDuration}
                    onValueChange={(v) => setTmpDuration(v)}
                    style={styles.pickerIOS}
                    itemStyle={styles.pickerIOSItem}
                  >
                    {DURATIONS.map((d) => (
                      <Picker.Item
                        key={d.value}
                        label={d.label}
                        value={d.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </Modal>
          </>
        )}

        <Text style={[styles.label, { marginTop: 10 }]}>Kategori</Text>

        {/* ANDROID */}
        {Platform.OS === "android" ? (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(v) => setCategory(v)}
              enabled={!selectionLocked}
              style={styles.pickerAndroid}
              mode="dropdown"
              dropdownIconColor="#111"
            >
              {CATEGORIES.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>
        ) : (
          <>
            <Pressable
              style={[
                styles.selectBox,
                selectionLocked && styles.selectBoxDisabled,
              ]}
              onPress={() => {
                setTmpCategory(category);
                setShowCategoryModal(true);
              }}
              disabled={selectionLocked}
            >
              <Text style={styles.selectText}>{category}</Text>
            </Pressable>

            <Modal
              transparent
              animationType="slide"
              visible={showCategoryModal}
              onRequestClose={() => setShowCategoryModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                  <View style={styles.modalHeader}>
                    <Pressable onPress={() => setShowCategoryModal(false)}>
                      <Text style={styles.modalBtn}>İptal</Text>
                    </Pressable>

                    <Text style={styles.modalTitle}>Kategori Seç</Text>

                    <Pressable
                      onPress={() => {
                        setCategory(tmpCategory);
                        setShowCategoryModal(false);
                      }}
                    >
                      <Text style={[styles.modalBtn, styles.modalBtnDone]}>
                        Tamam
                      </Text>
                    </Pressable>
                  </View>

                  <Picker
                    selectedValue={tmpCategory}
                    onValueChange={(v) => setTmpCategory(v)}
                    style={styles.pickerIOS}
                    itemStyle={styles.pickerIOSItem}
                  >
                    {CATEGORIES.map((c) => (
                      <Picker.Item key={c} label={c} value={c} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>

      {/* TIMER */}
      <Timer
        duration={duration}
        category={category}
        isRunning={isRunning}
        resetSignal={resetSignal}
        distractions={distractions}
        onTick={(timeLeft) => setRemainingTime(timeLeft)}
        onSessionEnd={handleSessionEnd}
        onForcePause={() => {
          setIsRunning(false);
          setIsPaused(true);
        }}
      />

      {/* BUTTONS */}
      {!isRunning && !isPaused && (
        <Pressable
          style={[styles.btnSingle, styles.btnStart]}
          onPress={() => setIsRunning(true)}
        >
          <Text style={styles.btnText}>Başlat</Text>
        </Pressable>
      )}

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

      <Pressable
        style={[styles.btnSingle, styles.btnReset]}
        onPress={() => {
          setIsRunning(false);
          setIsPaused(false);
          setDistractions(0);
          setRemainingTime(duration); // ✅ eksik olan buydu
          setResetSignal((p) => !p);
        }}
      >
        <Text style={styles.btnText}>Sıfırla</Text>
      </Pressable>
    </View>
  );
}

/* -----------------------------------
   STYLES
----------------------------------- */
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
    elevation: 3,
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#111" },

  pickerWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  pickerAndroid: { height: 50, color: "#111", width: "100%" },

  selectBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  selectBoxDisabled: { opacity: 0.5 },
  selectText: { fontSize: 16, fontWeight: "600", color: "#111" },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  modalBtn: { fontSize: 16, color: "#666", fontWeight: "600" },
  modalBtnDone: { color: "#1e90ff" },

  pickerIOS: { height: 220 },
  pickerIOSItem: { fontSize: 18, color: "#111" },

  actionRow: { flexDirection: "row", marginVertical: 10 },
  btn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  btnSingle: {
    width: "60%",
    alignSelf: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 6,
    alignItems: "center",
  },
  btnStart: { backgroundColor: "#4CAF50" },
  btnPause: { backgroundColor: "#ff9800" },
  btnFinish: { backgroundColor: "#1976D2" },
  btnReset: { backgroundColor: "#e53935" },
  btnText: { color: "#fff", fontWeight: "700" },
});
