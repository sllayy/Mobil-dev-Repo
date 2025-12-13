// @ts-nocheck
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

import {
  getAllTimeMinutes,
  getCategoryDistribution,
  getLast7DaysChartData,
  getTodayTotalMinutes,
  getTotalDistractions,
} from "../storage/sessions";

const screenWidth = Dimensions.get("window").width;
const chartWidth = Platform.OS === "web" ? Math.min(screenWidth - 20, 500) : screenWidth - 20;

export default function ReportsScreen() {
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [allTimeMinutes, setAllTimeMinutes] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);

  const [weekData, setWeekData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  async function loadData() {
    setTodayMinutes(await getTodayTotalMinutes());
    setAllTimeMinutes(await getAllTimeMinutes());
    setTotalDistractions(await getTotalDistractions());
    setWeekData(await getLast7DaysChartData());
    setCategoryData(await getCategoryDistribution());
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>

      {/* ÖZETLER */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Bugünkü Odak Süresi</Text>
        <Text style={styles.cardValue}>{todayMinutes} dk</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Toplam Odak Süresi</Text>
        <Text style={styles.cardValue}>{allTimeMinutes} dk</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Toplam Dikkat Dağınıklığı</Text>
        <Text style={styles.cardValue}>{totalDistractions}</Text>
      </View>

      {/* 7 GÜN */}
      <Text style={styles.chartTitle}>Son 7 Gün Odak Süresi</Text>

      {weekData.length > 0 && (
        <BarChart
          data={{
            labels: weekData.map((d) => d.date),
            datasets: [{ data: weekData.map((d) => d.minutes) }],
          }}
          width={chartWidth}
          height={250}
          fromZero
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}

      {/* KATEGORİ */}
      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>

      {categoryData.length > 0 && (
        <PieChart
          data={categoryData.map((c) => ({
            name: c.name,
            population: c.duration,
            color: c.color,
          }))}
          width={chartWidth}
          height={260}
          accessor="population"
          backgroundColor="transparent"
          hasLegend={true}
        />
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: () => `#000`,
  labelColor: () => "#000",
};

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: "#fafafa" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: { fontSize: 16, color: "#555" },
  cardValue: { fontSize: 22, fontWeight: "bold", color: "#111" },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginTop: 28, marginBottom: 12 },
  chart: { borderRadius: 12 },
});
