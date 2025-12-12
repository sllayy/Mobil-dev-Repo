// @ts-nocheck
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  getAllTimeMinutes,
  getCategoryDistribution,
  getLast7DaysChartData,
  getTodayTotalMinutes,
  getTotalDistractions,
} from "../storage/sessions";

import { BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  // METRİKLER
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [allTimeMinutes, setAllTimeMinutes] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);

  // GRAFİK VERİLERİ
  const [weekData, setWeekData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // SAYFAYA GİRİNCE VERİLERİ YÜKLE
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setTodayMinutes(await getTodayTotalMinutes());
    setAllTimeMinutes(await getAllTimeMinutes());
    setTotalDistractions(await getTotalDistractions());
    setWeekData(await getLast7DaysChartData());
    setCategoryData(await getCategoryDistribution());
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>

      {/* ÖZET KARTLARI */}
      <View style={styles.card}>
        <Text style={styles.label}>Bugünkü Odak Süresi</Text>
        <Text style={styles.value}>{todayMinutes} dk</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Toplam Odak Süresi</Text>
        <Text style={styles.value}>{allTimeMinutes} dk</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Toplam Dikkat Dağınıklığı</Text>
        <Text style={styles.value}>{totalDistractions}</Text>
      </View>

      {/* SON 7 GÜN GRAFİĞİ */}
      <Text style={styles.chartTitle}>Son 7 Gün Odak Süresi</Text>
      {weekData.length > 0 && (
        <BarChart
          data={{
            labels: weekData.map((d) => d.date),
            datasets: [{ data: weekData.map((d) => d.minutes) }],
          }}
          width={screenWidth - 20}
          height={250}
          fromZero
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: () => "#000",
          }}
          style={styles.chart}
        />
      )}

      {/* KATEGORİ PASTA GRAFİĞİ */}
      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      {categoryData.length > 0 && (
        <PieChart
          data={categoryData.map((c) => ({
            name: c.name,
            population: c.duration,
            color: c.color,
            legendFontColor: "#000",
            legendFontSize: 14,
          }))}
          width={screenWidth - 20}
          height={250}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fafafa" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 2,
  },
  label: { fontSize: 16, color: "#555" },
  value: { fontSize: 22, fontWeight: "bold", color: "#111" },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  chart: { borderRadius: 10 },
});
