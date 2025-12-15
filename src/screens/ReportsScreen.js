// @ts-nocheck
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

import {
  getAllTimeMinutes,
  getCategoryDistribution,
  getLast7DaysChartData,
  getTodayTotalMinutes,
  getTotalDistractions,
} from "../storage/sessions";

/* --------------------------------------------------
   RESPONSIVE WIDTH
-------------------------------------------------- */
const screenWidth = Dimensions.get("window").width;
const baseWidth =
  Platform.OS === "web" ? Math.min(screenWidth - 32, 520) : screenWidth - 32;

/* --------------------------------------------------
   CHART CONFIG
-------------------------------------------------- */
const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  propsForBackgroundLines: { strokeWidth: 0 },
  propsForLabels: { fontSize: 11 },
};

export default function ReportsScreen() {
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [allTimeMinutes, setAllTimeMinutes] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);
  const [weekData, setWeekData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const loadData = useCallback(async () => {
    const [t, all, dist, week, cat] = await Promise.all([
      getTodayTotalMinutes(),
      getAllTimeMinutes(),
      getTotalDistractions(),
      getLast7DaysChartData(),
      getCategoryDistribution(),
    ]);

    setTodayMinutes(t || 0);
    setAllTimeMinutes(all || 0);
    setTotalDistractions(dist || 0);
    setWeekData(Array.isArray(week) ? week : []);
    setCategoryData(Array.isArray(cat) ? cat : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  /* --------------------------------------------------
     BAR DATA
-------------------------------------------------- */
  const barData = useMemo(() => {
    return {
      labels: weekData.map((d) => d.date), // MM-DD
      datasets: [{ data: weekData.map((d) => d.minutes || 0) }],
    };
  }, [weekData]);

  /* --------------------------------------------------
     PIE DATA (%)
-------------------------------------------------- */
  const pieData = useMemo(() => {
    const total = categoryData.reduce((s, c) => s + (c.duration || 0), 0);

    return categoryData
      .map((c) => {
        const pct = total ? Math.round((c.duration / total) * 100) : 0;
        return {
          name: `${c.name} %${pct}`,
          population: c.duration,
          color: c.color,
          legendFontColor: "#333",
          legendFontSize: 12,
        };
      })
      .filter((x) => x.population > 0);
  }, [categoryData]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Raporlar</Text>

      {/* GENEL İSTATİSTİKLER */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Bugün Toplam Odaklanma Süresi</Text>
        <Text style={styles.cardValue}>{todayMinutes} dk</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          Tüm Zamanların Toplam Odaklanma Süresi
        </Text>
        <Text style={styles.cardValue}>{allTimeMinutes} dk</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Toplam Dikkat Dağınıklığı</Text>
        <Text style={styles.cardValue}>{totalDistractions}</Text>
      </View>

      {/* BAR CHART */}
      <Text style={styles.chartTitle}>Son 7 Gün Odaklanma Süresi (dk)</Text>

      {weekData.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartWrap}>
            <BarChart
              data={barData}
              width={Math.max(baseWidth, 520)} // 🔥 kritik
              height={260}
              fromZero
              chartConfig={chartConfig}
              style={styles.chart}
              withInnerLines={false}
              yAxisSuffix=" dk"
            />
          </View>
        </ScrollView>
      )}

      {/* PIE CHART */}
      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>

      {pieData.length > 0 && (
        <View style={styles.chartWrap}>
          <PieChart
            data={pieData}
            width={baseWidth}
            height={300}
            accessor="population"
            backgroundColor="transparent"
            chartConfig={chartConfig}
            paddingLeft="10"
            absolute
          />
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: { backgroundColor: "#fafafa" },
  content: { padding: 16, paddingBottom: 24 },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 16,
    color: "#111",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 3,
  },
  cardLabel: { fontSize: 15, color: "#555", fontWeight: "600" },
  cardValue: { fontSize: 24, fontWeight: "900", color: "#111", marginTop: 6 },

  chartTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 26,
    marginBottom: 12,
    color: "#111",
  },

  chartWrap: { paddingRight: 16 },
  chart: { borderRadius: 12 },
});
