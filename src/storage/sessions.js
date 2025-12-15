import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "SESSIONS";

/* ==================================================
   UTIL
================================================== */

// YYYY-MM-DD
function toDayString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// saniye → dakika
// 1–60 sn => 1 dk (raporda 0 görünmesin diye)
function secondsToMinutes(sec) {
  const s = Math.max(0, safeNumber(sec, 0));
  if (s === 0) return 0;
  return Math.ceil(s / 60);
}

/* ==================================================
   SAVE SESSION
   session = {
     duration: seçilen toplam süre (sn)
     remainingTime: bitince kalan süre (sn)
     workedTime?: direkt gönderilirse öncelik bu
     category
     distractions
     date? (opsiyonel)
   }
================================================== */
export async function saveSession(session) {
  if (!session || !session.category) {
    console.log("INVALID SESSION:", session);
    return;
  }

  try {
    const raw = await AsyncStorage.getItem(KEY);
    const sessions = raw ? JSON.parse(raw) : [];

    const duration = Math.max(0, safeNumber(session.duration, 0));
    const remainingTime = Math.max(0, safeNumber(session.remainingTime, 0));

    // ✅ GERÇEK ÇALIŞILAN SÜRE (sn)
    const workedTime =
      typeof session.workedTime === "number"
        ? Math.max(0, session.workedTime)
        : Math.max(0, duration - remainingTime);

    // 0 saniye çalışıldıysa KAYDETME
    if (workedTime <= 0) return;

    const newSession = {
      duration, // bilgi amaçlı
      workedTime, // 🔥 RAPORLARIN TEK GERÇEĞİ
      category: String(session.category),
      distractions: Math.max(0, safeNumber(session.distractions, 0)),
      date: session.date ? String(session.date) : new Date().toISOString(),
    };

    sessions.push(newSession);
    await AsyncStorage.setItem(KEY, JSON.stringify(sessions));
  } catch (err) {
    console.log("SESSION SAVE ERROR:", err);
  }
}

/* ==================================================
   LOAD ALL
================================================== */
export async function getAllSessions() {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.log("SESSION LOAD ERROR:", err);
    return [];
  }
}

/* ==================================================
   BACKWARD COMPATIBILITY
   Eski kayıtlarda workedTime yoksa duration kullan
================================================== */
function getWorkedTime(s) {
  const worked = safeNumber(s?.workedTime, NaN);
  if (Number.isFinite(worked)) return Math.max(0, worked);
  return Math.max(0, safeNumber(s?.duration, 0));
}

/* ==================================================
   TODAY TOTAL (minutes)
================================================== */
export async function getTodayTotalMinutes() {
  const sessions = await getAllSessions();
  const today = toDayString();

  const totalSeconds = sessions
    .filter((s) => s?.date?.startsWith(today))
    .reduce((sum, s) => sum + getWorkedTime(s), 0);

  return secondsToMinutes(totalSeconds);
}

/* ==================================================
   ALL TIME TOTAL (minutes)
================================================== */
export async function getAllTimeMinutes() {
  const sessions = await getAllSessions();

  const totalSeconds = sessions.reduce((sum, s) => sum + getWorkedTime(s), 0);

  return secondsToMinutes(totalSeconds);
}

/* ==================================================
   TOTAL DISTRACTIONS
================================================== */
export async function getTotalDistractions() {
  const sessions = await getAllSessions();

  return sessions.reduce(
    (sum, s) => sum + Math.max(0, safeNumber(s?.distractions, 0)),
    0
  );
}

/* ==================================================
   LAST 7 DAYS (BAR CHART)
================================================== */
export async function getLast7DaysChartData() {
  const sessions = await getAllSessions();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const key = toDayString(date);

    const totalSeconds = sessions
      .filter((s) => s?.date?.startsWith(key))
      .reduce((sum, s) => sum + getWorkedTime(s), 0);

    result.push({
      date: key.slice(5), // MM-DD
      minutes: secondsToMinutes(totalSeconds),
    });
  }

  return result;
}

/* ==================================================
   CATEGORY DISTRIBUTION (PIE CHART)
================================================== */
export async function getCategoryDistribution() {
  const sessions = await getAllSessions();
  const map = {};

  sessions.forEach((s) => {
    const key = s?.category ? String(s.category) : "Diğer";
    if (!map[key]) map[key] = 0;
    map[key] += getWorkedTime(s);
  });

  return Object.keys(map)
    .map((cat) => ({
      name: cat,
      duration: secondsToMinutes(map[cat]),
      color: autoColor(cat),
    }))
    .filter((x) => x.duration > 0); // ❗ crash önleme
}

/* ==================================================
   CLEAR (DEBUG / TEST)
================================================== */
export async function clearAllSessions() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (err) {
    console.log("CLEAR ERROR:", err);
  }
}

/* ==================================================
   AUTO COLOR
================================================== */
function autoColor(text) {
  const colors = [
    "#FF6B6B",
    "#4D96FF",
    "#6BCB77",
    "#FFD93D",
    "#845EC2",
    "#FF9671",
    "#2C73D2",
  ];

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
