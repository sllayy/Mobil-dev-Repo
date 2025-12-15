import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Timer({
  duration, // toplam süre (sn)
  category,
  isRunning,
  resetSignal,
  distractions, // sadece gösterim
  onTick, // (timeLeft) => void
  onSessionEnd, // ({ duration, remainingTime, category, distractions })
}) {
  const [time, setTime] = useState(duration);

  const intervalRef = useRef(null);
  const finishedRef = useRef(false);

  /* -----------------------------------
     RESET (duration veya resetSignal)
  ----------------------------------- */
  useEffect(() => {
    setTime(duration);
    finishedRef.current = false;
    onTick?.(duration);
  }, [duration, resetSignal]);

  /* -----------------------------------
     TIMER MOTOR
     - SADECE isRunning'e bakar
     - TEK interval
  ----------------------------------- */
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  /* -----------------------------------
     HER SANİYE DIŞARI BİLDİR
     ⚠️ EFFECT → render içinde setState yok
  ----------------------------------- */
  useEffect(() => {
    onTick?.(time);
  }, [time]);

  /* -----------------------------------
     SÜRE BİTİNCE
     ⚠️ TEK SEFER ÇAĞRILIR
  ----------------------------------- */
  useEffect(() => {
    if (!isRunning) return;
    if (time !== 0) return;
    if (finishedRef.current) return;

    finishedRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    onSessionEnd?.({
      duration,
      remainingTime: 0,
      category,
      distractions,
    });
  }, [time, isRunning]);

  /* -----------------------------------
     FORMAT
  ----------------------------------- */
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(time)}</Text>
      <Text style={styles.info}>Kategori: {category}</Text>
      <Text style={styles.info}>Dikkat Dağınıklığı: {distractions}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  time: {
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 10,
  },
  info: {
    fontSize: 18,
    marginTop: 4,
  },
});
