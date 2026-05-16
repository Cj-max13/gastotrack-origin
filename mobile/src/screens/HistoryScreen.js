import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SectionList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

// ── Constants ────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'GCash', 'Maya', 'Cash', 'Food', 'Travel'];

// Map category/source keywords to icons and colors
const ICON_MAP = {
  'food':          { icon: 'fast-food-outline',       color: '#E74C3C' },
  'dining':        { icon: 'restaurant-outline',      color: '#E67E22' },
  'drinks':        { icon: 'cafe-outline',            color: '#00704A' },
  'transport':     { icon: 'car-outline',             color: '#0057A8' },
  'groceries':     { icon: 'bag-outline',             color: '#0057A8' },
  'income':        { icon: 'cash-outline',            color: '#2ECC71' },
  'utilities':     { icon: 'flash-outline',           color: '#E67E22' },
  'entertainment': { icon: 'film-outline',            color: '#E50914' },
  'shopping':      { icon: 'cart-outline',            color: '#EE4D2D' },
  'travel':        { icon: 'airplane-outline',        color: '#3498DB' },
  'health':        { icon: 'medkit-outline',          color: '#E74C3C' },
  'education':     { icon: 'school-outline',          color: '#9B59B6' },
};

function getIconForCategory(category = '') {
  const key = category.toLowerCase();
  for (const [k, v] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return v;
  }
  return { icon: 'receipt-outline', color: '#888' };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatSectionTitle(dateStr) {
  const date   = new Date(dateStr);
  const today  = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();

  if (sameDay(date, today))     return 'TODAY';
  if (sameDay(date, yesterday)) return 'YESTERDAY';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

function groupByDate(transactions) {
  const groups = {};
  transactions.forEach(tx => {
    const day = new Date(tx.date).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(tx);
  });

  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map(day => ({
      title: formatSectionTitle(groups[day][0].date),
      data:  groups[day],
    }));
}

// ── Transaction Row ──────────────────────────────────────────────────────────
function TransactionRow({ item }) {
  const isIncome = item.amount > 0;
  const { icon, color } = getIconForCategory(item.category);

  return (
    <View style={s.txRow}>
      <View style={[s.txIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={s.txInfo}>
        <Text style={s.txName}>{item.merchant}</Text>
        <Text style={s.txSub}>{item.source} · {item.category}</Text>
      </View>
      <Text style={[s.txAmount, { color: isIncome ? '#2ECC71' : '#E74C3C' }]}>
        {isIncome ? '+ ' : '- '}₱{Math.abs(item.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

// ── History Screen ───────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [activeFilter, setFilter]       = useState('All');

  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.get('/api/transactions');
      setTransactions(res.data);
    } catch (err) {
      setError('Failed to load transactions. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = useMemo(() => {
    let list = transactions;

    if (activeFilter !== 'All') {
      list = list.filter(tx =>
        tx.source?.toLowerCase().includes(activeFilter.toLowerCase()) ||
        tx.category?.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(tx =>
        tx.merchant?.toLowerCase().includes(q) ||
        tx.category?.toLowerCase().includes(q) ||
        tx.source?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, search, activeFilter]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

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

      {/* ── Search ── */}
      <View style={s.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#AAA" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#AAA"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#AAA" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter Chips ── */}
      <View style={s.filterContainer}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={s.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.chip, activeFilter === item && s.chipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[s.chipText, activeFilter === item && s.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#0D2B2B" />
          <Text style={s.loadingText}>Loading transactions...</Text>
        </View>
      ) : error ? (
        <View style={s.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color="#CCC" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchTransactions()}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={s.centered}>
          <Ionicons name="receipt-outline" size={48} color="#CCC" />
          <Text style={s.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTransactions(true)}
              tintColor="#0D2B2B"
            />
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={s.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => <TransactionRow item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F7F8FA' },

  // Header
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  appName:    { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },

  // Search
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  searchIcon:    { marginRight: 8 },
  searchInput:   { flex: 1, fontSize: 14, color: '#333' },

  // Filter chips
  filterContainer: { height: 48, marginBottom: 4 },
  filterList:      { paddingHorizontal: 16, alignItems: 'center' },
  chip:            { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E8EEEE', marginRight: 8 },
  chipActive:      { backgroundColor: '#0D2B2B' },
  chipText:        { fontSize: 13, fontWeight: '600', color: '#0D2B2B' },
  chipTextActive:  { color: '#fff' },

  // List
  listContent:   { paddingHorizontal: 16, paddingBottom: 24 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 0.6, marginTop: 20, marginBottom: 10 },

  // Transaction row
  txRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  txIcon:  { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txInfo:  { flex: 1 },
  txName:  { fontSize: 14, fontWeight: '600', color: '#0D2B2B' },
  txSub:   { fontSize: 12, color: '#888', marginTop: 2 },
  txAmount:{ fontSize: 14, fontWeight: '700' },

  // States
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#888', marginTop: 8 },
  errorText:   { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 32 },
  emptyText:   { fontSize: 15, color: '#AAA' },
  retryBtn:    { backgroundColor: '#0D2B2B', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText:   { color: '#fff', fontWeight: '600' },
});
