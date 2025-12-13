import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = "SESSIONS";

// --- Seans kaydet ---
export async function saveSession(session) {
  if (!session || !session.duration || !session.category) {
    console.log("INVALID SESSION:", session);
    return;
  }

  try {
    const existing = await AsyncStorage.getItem(KEY);
    const sessions = existing ? JSON.parse(existing) : [];

    const newSession = {
      duration: Number(session.duration),
      category: session.category,
      distractions: Number(session.distractions) || 0,
      date: new Date().toISOString(),
    };

    sessions.push(newSession);

    await AsyncStorage.setItem(KEY, JSON.stringify(sessions));
  } catch (err) {
    console.log("SESSION SAVE ERROR:", err);
  }
}

// --- Tüm seansları getir ---
export async function getAllSessions() {
  try {
    const data = await AsyncStorage.getItem(KEY);
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
    .reduce((sum, s) => sum + (s.duration || 0), 0);

  return Math.round(total / 60);
}

// --- Tüm zamanlar ---
export async function getAllTimeMinutes() {
  const sessions = await getAllSessions();
  return Math.round(
    sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  );
}

// --- Toplam dikkat dağınıklığı ---
export async function getTotalDistractions() {
  const sessions = await getAllSessions();
  return sessions.reduce((sum, s) => sum + (s.distractions || 0), 0);
}

// --- Son 7 gün ---
export async function getLast7DaysChartData() {
  const sessions = await getAllSessions();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const dayISO = date.toISOString().slice(0, 10);

    const total = sessions
      .filter((s) => s.date.startsWith(dayISO))
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    result.push({
      date: dayISO.slice(5), // MM-DD
      minutes: Math.round(total / 60),
    });
  }

  return result;
}

// --- Kategorilere göre PieChart verisi ---
export async function getCategoryDistribution() {
  const sessions = await getAllSessions();
  const categories = {};

  sessions.forEach((s) => {
    const key = s.category || "Diğer";
    if (!categories[key]) categories[key] = 0;
    categories[key] += s.duration || 0;
  });

  return Object.keys(categories).map((cat) => ({
    name: cat,
    duration: Math.round(categories[cat] / 60),
    color: autoColor(cat),
  }));
}

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
  for (let i = 0; i < text.length; i++)
    hash = text.charCodeAt(i) + ((hash << 5) - hash);

  return colors[Math.abs(hash) % colors.length];
}
