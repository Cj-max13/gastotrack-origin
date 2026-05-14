import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;

// ── Mock Data ────────────────────────────────────────────────────────────────
const DATA = {
  Day: {
    total: 605,
    categories: [
      { name: 'Food & Drinks', amount: 320, color: '#0D2B2B' },
      { name: 'Transport',     amount: 185, color: '#4ABFBF' },
      { name: 'Shopping',      amount: 100, color: '#A8D8D8' },
    ],
    dailyTrends: [320, 605, 480, 720, 354, 210, 490],
    avgPerDay: 354.28,
    vsLast: 12,
    highest: [
      { name: 'Starbucks',   amount: 185,  icon: 'cafe-outline',      color: '#00704A' },
      { name: 'Grab Car',    amount: 420,  icon: 'car-outline',       color: '#0057A8' },
      { name: 'Jollibee',    amount: 185,  icon: 'fast-food-outline', color: '#D52B1E' },
    ],
  },
  Week: {
    total: 2480,
    categories: [
      { name: 'Food & Drinks',   amount: 840,  color: '#0D2B2B' },
      { name: 'Bills & Utilities',amount: 1200, color: '#4ABFBF' },
      { name: 'Shopping',        amount: 440,  color: '#A8D8D8' },
    ],
    dailyTrends: [320, 605, 780, 420, 354, 210, 490],
    avgPerDay: 354.28,
    vsLast: 12,
    highest: [
      { name: 'Whole Foods',        amount: 420.50, icon: 'restaurant-outline', color: '#0D2B2B' },
      { name: 'Amazon Marketplace', amount: 285.20, icon: 'cart-outline',       color: '#FF9900' },
      { name: 'City Power Grid',    amount: 195.00, icon: 'flash-outline',      color: '#4ABFBF' },
    ],
  },
  Month: {
    total: 24580,
    categories: [
      { name: 'Food & Drinks',    amount: 8400,  color: '#0D2B2B' },
      { name: 'Bills & Utilities',amount: 9200,  color: '#4ABFBF' },
      { name: 'Shopping',         amount: 4400,  color: '#A8D8D8' },
      { name: 'Transport',        amount: 2580,  color: '#C8E8E8' },
    ],
    dailyTrends: [820, 1200, 780, 1420, 954, 610, 890],
    avgPerDay: 819.33,
    vsLast: -8,
    highest: [
      { name: 'Meralco Bill',    amount: 3240.50, icon: 'flash-outline',      color: '#E67E22' },
      { name: 'SM Supermarket',  amount: 2450.00, icon: 'bag-outline',        color: '#0057A8' },
      { name: 'Netflix',         amount: 549.00,  icon: 'film-outline',       color: '#E50914' },
    ],
  },
};

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ── Donut Chart (pure View) ──────────────────────────────────────────────────
function DonutChart({ categories, total }) {
  const SIZE   = 180;
  const STROKE = 28;
  const R      = (SIZE - STROKE) / 2;
  const CIRC   = 2 * Math.PI * R;

  // Build segments as conic-gradient-like stacked rings using rotation trick
  let cumulative = 0;
  const segments = categories.map(cat => {
    const pct   = cat.amount / total;
    const start = cumulative;
    cumulative += pct;
    return { ...cat, pct, start };
  });

  return (
    <View style={donut.wrapper}>
      {/* Rings stacked using border trick */}
      <View style={[donut.ring, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]}>
        {/* Background ring */}
        <View style={[donut.ringBase, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]} />

        {/* Colored segments using clip trick */}
        {segments.map((seg, i) => {
          const deg = seg.pct * 360;
          return (
            <View
              key={i}
              style={[
                donut.segment,
                {
                  width: SIZE,
                  height: SIZE,
                  borderRadius: SIZE / 2,
                  borderColor: seg.color,
                  transform: [{ rotate: `${seg.start * 360}deg` }],
                  borderTopWidth:   STROKE,
                  borderRightWidth: deg > 90  ? STROKE : 0,
                  borderBottomWidth:deg > 180 ? STROKE : 0,
                  borderLeftWidth:  deg > 270 ? STROKE : 0,
                },
              ]}
            />
          );
        })}

        {/* Inner white circle (hole) */}
        <View style={[donut.hole, {
          width:  SIZE - STROKE * 2,
          height: SIZE - STROKE * 2,
          borderRadius: (SIZE - STROKE * 2) / 2,
        }]}>
          <Text style={donut.totalAmt}>
            ₱{total >= 1000 ? (total / 1000).toFixed(1) + 'K' : total.toLocaleString()}
          </Text>
          <Text style={donut.totalLabel}>TOTAL</Text>
        </View>
      </View>
    </View>
  );
}

// ── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const max    = Math.max(...data);
  const BAR_H  = 100;
  const barW   = (CARD_W - 48) / data.length - 8;

  return (
    <View style={bar.wrapper}>
      <View style={bar.bars}>
        {data.map((val, i) => {
          const h = (val / max) * BAR_H;
          return (
            <View key={i} style={bar.col}>
              <View style={bar.barBg}>
                <View style={[bar.barFill, { height: h }]} />
              </View>
              <Text style={bar.label}>{DAYS[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Expenditure Row ──────────────────────────────────────────────────────────
function ExpenditureRow({ item, total }) {
  const pct = Math.round((item.amount / total) * 100);
  return (
    <View style={exp.row}>
      <View style={[exp.icon, { backgroundColor: item.color + '18' }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={exp.info}>
        <Text style={exp.name}>{item.name}</Text>
        <Text style={exp.amount}>₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
        <View style={exp.barBg}>
          <View style={[exp.barFill, { width: `${pct}%`, backgroundColor: item.color }]} />
        </View>
      </View>
    </View>
  );
}

// ── Analytics Screen ─────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const [period, setPeriod] = useState('Week');
  const d = DATA[period];

  const totalHighest = useMemo(
    () => d.highest.reduce((sum, h) => sum + h.amount, 0),
    [d]
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.avatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <Text style={s.appName}>GastoTrack</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#0D2B2B" />
        </TouchableOpacity>
      </View>

      {/* ── Period Toggle ── */}
      <View style={s.toggleWrapper}>
        {['Day', 'Week', 'Month'].map(p => (
          <TouchableOpacity
            key={p}
            style={[s.toggleBtn, period === p && s.toggleActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[s.toggleText, period === p && s.toggleTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Spending Breakdown ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Spending Breakdown</Text>

          <DonutChart categories={d.categories} total={d.total} />

          {/* Legend */}
          <View style={s.legend}>
            {d.categories.map((cat, i) => (
              <View key={i} style={s.legendRow}>
                <View style={[s.legendDot, { backgroundColor: cat.color }]} />
                <Text style={s.legendName}>{cat.name}</Text>
                <Text style={s.legendAmt}>
                  ₱{cat.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Daily Trends ── */}
        <View style={s.card}>
          <View style={s.trendHeader}>
            <View>
              <Text style={s.cardTitle}>Daily Trends</Text>
              <Text style={s.trendSub}>Avg. ₱{d.avgPerDay.toLocaleString()} / day</Text>
            </View>
            <View style={[s.badge, { backgroundColor: d.vsLast >= 0 ? '#E8F8F0' : '#FEF0F0' }]}>
              <Ionicons
                name={d.vsLast >= 0 ? 'trending-up' : 'trending-down'}
                size={12}
                color={d.vsLast >= 0 ? '#2ECC71' : '#E74C3C'}
              />
              <Text style={[s.badgeText, { color: d.vsLast >= 0 ? '#2ECC71' : '#E74C3C' }]}>
                {' '}{Math.abs(d.vsLast)}% vs last week
              </Text>
            </View>
          </View>

          <BarChart data={d.dailyTrends} />

          {/* AI Insight */}
          <View style={s.insightRow}>
            <View style={s.insightIcon}>
              <Ionicons name="hardware-chip-outline" size={18} color="#0D2B2B" />
            </View>
            <View style={s.insightText}>
              <Text style={s.insightLabel}>AI Insight</Text>
              <Text style={s.insightMsg}>
                Your spending on Wednesday peaked due to "Shopping".
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#AAA" />
          </View>
        </View>

        {/* ── Highest Expenditure ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Highest Expenditure</Text>
          {d.highest.map((item, i) => (
            <ExpenditureRow key={i} item={item} total={totalHighest} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F7F8FA' },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  // Header
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  appName:    { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },

  // Period toggle
  toggleWrapper: { flexDirection: 'row', backgroundColor: '#E8EEEE', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, padding: 4 },
  toggleBtn:     { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  toggleActive:  { backgroundColor: '#0D2B2B' },
  toggleText:    { fontSize: 14, fontWeight: '600', color: '#888' },
  toggleTextActive: { color: '#fff' },

  // Card
  card:      { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#0D2B2B', marginBottom: 4 },

  // Legend
  legend:     { marginTop: 8 },
  legendRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  legendDot:  { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendName: { flex: 1, fontSize: 14, color: '#333' },
  legendAmt:  { fontSize: 14, fontWeight: '600', color: '#0D2B2B' },

  // Trend header
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  trendSub:    { fontSize: 12, color: '#888', marginTop: 2 },
  badge:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText:   { fontSize: 11, fontWeight: '600' },

  // AI Insight
  insightRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F8F8', borderRadius: 12, padding: 12, marginTop: 12 },
  insightIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0EEEE', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  insightText: { flex: 1 },
  insightLabel:{ fontSize: 11, fontWeight: '700', color: '#888', marginBottom: 2 },
  insightMsg:  { fontSize: 13, color: '#333', lineHeight: 18 },
});

const donut = StyleSheet.create({
  wrapper:    { alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  ring:       { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringBase:   { position: 'absolute', borderWidth: 28, borderColor: '#E8EEEE' },
  segment:    { position: 'absolute', borderColor: 'transparent' },
  hole:       { position: 'absolute', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  totalAmt:   { fontSize: 22, fontWeight: '800', color: '#0D2B2B' },
  totalLabel: { fontSize: 11, color: '#AAA', letterSpacing: 1 },
});

const bar = StyleSheet.create({
  wrapper: { marginVertical: 8 },
  bars:    { flexDirection: 'row', alignItems: 'flex-end', height: 120, justifyContent: 'space-between', paddingHorizontal: 4 },
  col:     { alignItems: 'center', flex: 1 },
  barBg:   { width: 20, height: 100, backgroundColor: '#E8EEEE', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: '#0D2B2B', borderRadius: 6 },
  label:   { fontSize: 11, color: '#AAA', marginTop: 6 },
});

const exp = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  icon:   { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info:   { flex: 1 },
  name:   { fontSize: 14, fontWeight: '600', color: '#0D2B2B' },
  amount: { fontSize: 13, color: '#555', marginBottom: 6 },
  barBg:  { height: 4, backgroundColor: '#E8EEEE', borderRadius: 2, overflow: 'hidden' },
  barFill:{ height: 4, borderRadius: 2 },
});
