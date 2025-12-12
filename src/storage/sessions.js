import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Seans kaydet ---
export async function saveSession(session) {
  try {
    const existing = await AsyncStorage.getItem("SESSIONS");
    const sessions = existing ? JSON.parse(existing) : [];

    const newSession = {
      duration: session.duration,         // saniye
      category: session.category,         // Ders, Kodlama, vb.
      distractions: session.distractions, // integer
      date: new Date().toISOString(),     // ISO tarih
    };

    sessions.push(newSession);

    await AsyncStorage.setItem("SESSIONS", JSON.stringify(sessions));
  } catch (err) {
    console.log("SESSION SAVE ERROR:", err);
  }
}

// --- Tüm seansları getir ---
export async function getAllSessions() {
  try {
    const data = await AsyncStorage.getItem("SESSIONS");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.log("SESSION LOAD ERROR:", err);
    return [];
  }
}

// --- Bugünkü toplam süre ---
export async function getTodayTotalMinutes() {
  const sessions = await getAllSessions();
  const today = new Date().toISOString().slice(0, 10);

  const total = sessions
    .filter((s) => s.date.startsWith(today))
    .reduce((sum, s) => sum + s.duration, 0);

  return Math.round(total / 60); // dakika
}

// --- Tüm zamanlar toplam süre ---
export async function getAllTimeMinutes() {
  const sessions = await getAllSessions();
  const total = sessions.reduce((sum, s) => sum + s.duration, 0);
  return Math.round(total / 60);
}

// --- Toplam dikkat dağınıklığı ---
export async function getTotalDistractions() {
  const sessions = await getAllSessions();
  return sessions.reduce((sum, s) => sum + s.distractions, 0);
}

// --- Son 7 gün için grafik verisi ---
export async function getLast7DaysChartData() {
  const sessions = await getAllSessions();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const day = date.toISOString().slice(0, 10);

    const total = sessions
      .filter((s) => s.date.startsWith(day))
      .reduce((sum, s) => sum + s.duration, 0);

    result.push({
      date: day.slice(5), // MM-DD gösterilir
      minutes: Math.round(total / 60),
    });
  }

  return result;
}

// --- Kategorilere göre Pie Chart verisi ---
export async function getCategoryDistribution() {
  const sessions = await getAllSessions();
  const categories = {};

  sessions.forEach((s) => {
    if (!categories[s.category]) categories[s.category] = 0;
    categories[s.category] += s.duration;
  });

  return Object.keys(categories).map((cat) => ({
    name: cat,
    duration: Math.round(categories[cat] / 60),
    color: generateColor(cat),
  }));
}

function generateColor(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++)
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  const color = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - color.length) + color;
}
