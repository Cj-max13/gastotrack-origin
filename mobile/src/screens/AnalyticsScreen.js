import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;
const DAYS   = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ── Category colors ───────────────────────────────────────────────────────────
const CATEGORY_COLORS = [
  '#0D2B2B', '#4ABFBF', '#A8D8D8', '#C8E8E8',
  '#E67E22', '#E74C3C', '#2ECC71', '#9B59B6',
];

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ categories, total }) {
  const SIZE   = 180;
  const STROKE = 28;

  let cumulative = 0;
  const segments = categories.map((cat, i) => {
    const pct   = total > 0 ? cat.amount / total : 0;
    const start = cumulative;
    cumulative += pct;
    return { ...cat, pct, start, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] };
  });

  return (
    <View style={donut.wrapper}>
      <View style={[donut.ring, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]}>
        <View style={[donut.ringBase, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]} />
        {segments.map((seg, i) => {
          const deg = seg.pct * 360;
          return (
            <View
              key={i}
              style={[
                donut.segment,
                {
                  width: SIZE, height: SIZE, borderRadius: SIZE / 2,
                  borderColor: seg.color,
                  transform: [{ rotate: `${seg.start * 360}deg` }],
                  borderTopWidth:    STROKE,
                  borderRightWidth:  deg > 90  ? STROKE : 0,
                  borderBottomWidth: deg > 180 ? STROKE : 0,
                  borderLeftWidth:   deg > 270 ? STROKE : 0,
                },
              ]}
            />
          );
        })}
        <View style={[donut.hole, { width: SIZE - STROKE * 2, height: SIZE - STROKE * 2, borderRadius: (SIZE - STROKE * 2) / 2 }]}>
          <Text style={donut.totalAmt}>
            ₱{total >= 1000 ? (total / 1000).toFixed(1) + 'K' : total.toLocaleString()}
          </Text>
          <Text style={donut.totalLabel}>TOTAL</Text>
        </View>
      </View>
    </View>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data, 1);
  return (
    <View style={bar.wrapper}>
      <View style={bar.bars}>
        {data.map((val, i) => {
          const h = (val / max) * 100;
          return (
            <View key={i} style={bar.col}>
              <View style={bar.barBg}>
                <View style={[bar.barFill, { height: Math.max(h, 2) }]} />
              </View>
              <Text style={bar.label}>{DAYS[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Expenditure Row ───────────────────────────────────────────────────────────
function ExpenditureRow({ item, total, color }) {
  const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
  return (
    <View style={exp.row}>
      <View style={[exp.icon, { backgroundColor: color + '18' }]}>
        <Ionicons name="receipt-outline" size={20} color={color} />
      </View>
      <View style={exp.info}>
        <Text style={exp.name}>{item.name}</Text>
        <Text style={exp.amount}>
          ₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </Text>
        <View style={exp.barBg}>
          <View style={[exp.barFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

// ── Analytics Screen ──────────────────────────────────────────────────────────
export default function AnalyticsScreen({ navigation }) {
  const [period, setPeriod]         = useState('Week');
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (p = period, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get(`/api/analytics/summary?period=${p.toLowerCase()}`);
      setData(res.data);
    } catch (err) {
      // keep previous data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(period); }, [period]);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAnalytics(period, true);
    });
    return unsubscribe;
  }, [navigation, period]);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    fetchAnalytics(p);
  };

  const total       = data?.total       || 0;
  const categories  = data?.categories  || [];
  const dailyTrends = data?.dailyTrends || Array(7).fill(0);
  const avgPerDay   = data?.avgPerDay   || 0;
  const vsLast      = data?.vsLast      || 0;
  const highest     = data?.highest     || [];
  const totalHighest = highest.reduce((s, h) => s + h.amount, 0);

  const categoriesWithColors = categories.map((cat, i) => ({
    ...cat,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

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
            onPress={() => handlePeriodChange(p)}
          >
            <Text style={[s.toggleText, period === p && s.toggleTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#0D2B2B" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAnalytics(period, true)} tintColor="#0D2B2B" />}
        >
          {/* ── Spending Breakdown ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Spending Breakdown</Text>

            {total === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptyText}>No spending data for this period.</Text>
              </View>
            ) : (
              <>
                <DonutChart categories={categoriesWithColors} total={total} />
                <View style={s.legend}>
                  {categoriesWithColors.map((cat, i) => (
                    <View key={i} style={s.legendRow}>
                      <View style={[s.legendDot, { backgroundColor: cat.color }]} />
                      <Text style={s.legendName}>{cat.name}</Text>
                      <Text style={s.legendAmt}>
                        ₱{cat.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* ── Daily Trends ── */}
          <View style={s.card}>
            <View style={s.trendHeader}>
              <View>
                <Text style={s.cardTitle}>Daily Trends</Text>
                <Text style={s.trendSub}>
                  Avg. ₱{avgPerDay.toLocaleString('en-PH', { minimumFractionDigits: 2 })} / day
                </Text>
              </View>
              {vsLast !== 0 && (
                <View style={[s.badge, { backgroundColor: vsLast <= 0 ? '#E8F8F0' : '#FEF0F0' }]}>
                  <Ionicons
                    name={vsLast <= 0 ? 'trending-down' : 'trending-up'}
                    size={12}
                    color={vsLast <= 0 ? '#2ECC71' : '#E74C3C'}
                  />
                  <Text style={[s.badgeText, { color: vsLast <= 0 ? '#2ECC71' : '#E74C3C' }]}>
                    {' '}{Math.abs(vsLast)}% vs last {period.toLowerCase()}
                  </Text>
                </View>
              )}
            </View>

            <BarChart data={dailyTrends} />

            {/* AI Insight */}
            <View style={s.insightRow}>
              <View style={s.insightIcon}>
                <Ionicons name="hardware-chip-outline" size={18} color="#0D2B2B" />
              </View>
              <View style={s.insightText}>
                <Text style={s.insightLabel}>Gasto</Text>
                <Text style={s.insightMsg}>
                  {vsLast > 0
                    ? `Your spending is ${vsLast}% higher than last ${period.toLowerCase()}. Consider reviewing your expenses.`
                    : vsLast < 0
                    ? `Great job! You spent ${Math.abs(vsLast)}% less than last ${period.toLowerCase()}.`
                    : `Your spending is consistent with last ${period.toLowerCase()}.`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#AAA" />
            </View>
          </View>

          {/* ── Highest Expenditure ── */}
          {highest.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Highest Expenditure</Text>
              {highest.map((item, i) => (
                <ExpenditureRow
                  key={i}
                  item={item}
                  total={totalHighest}
                  color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F7F8FA' },
  scroll:  { paddingHorizontal: 16, paddingBottom: 24 },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  appName:    { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },

  toggleWrapper:    { flexDirection: 'row', backgroundColor: '#E8EEEE', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, padding: 4 },
  toggleBtn:        { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  toggleActive:     { backgroundColor: '#0D2B2B' },
  toggleText:       { fontSize: 14, fontWeight: '600', color: '#888' },
  toggleTextActive: { color: '#fff' },

  card:      { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#0D2B2B', marginBottom: 4 },

  emptyCard: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#AAA' },

  legend:     { marginTop: 8 },
  legendRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  legendDot:  { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendName: { flex: 1, fontSize: 14, color: '#333' },
  legendAmt:  { fontSize: 14, fontWeight: '600', color: '#0D2B2B' },

  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  trendSub:    { fontSize: 12, color: '#888', marginTop: 2 },
  badge:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText:   { fontSize: 11, fontWeight: '600' },

  insightRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F8F8', borderRadius: 12, padding: 12, marginTop: 12 },
  insightIcon:  { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0EEEE', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  insightText:  { flex: 1 },
  insightLabel: { fontSize: 11, fontWeight: '700', color: '#888', marginBottom: 2 },
  insightMsg:   { fontSize: 13, color: '#333', lineHeight: 18 },
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
