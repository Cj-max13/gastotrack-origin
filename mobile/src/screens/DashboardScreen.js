import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const { width } = Dimensions.get('window');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, activeBudget }) {
  const max      = Math.max(...data, 1);
  const barWidth = (width - 80) / data.length - 6;

  return (
    <View style={chart.wrapper}>
      <View style={chart.bars}>
        {data.map((val, i) => {
          const isLast    = i === data.length - 1;
          const barHeight = (val / max) * 80;
          const now       = new Date();
          const mIdx      = (now.getMonth() - (data.length - 1 - i) + 12) % 12;
          return (
            <View key={i} style={chart.barCol}>
              <View
                style={[
                  chart.bar,
                  { height: Math.max(barHeight, 4), width: barWidth },
                  isLast ? chart.barActive : chart.barInactive,
                ]}
              />
              <Text style={chart.label}>{MONTHS[mIdx]}</Text>
            </View>
          );
        })}
      </View>
      <View style={chart.budgetRow}>
        <Text style={chart.budgetLabel}>ACTIVE BUDGET</Text>
        <Text style={chart.budgetValue}>
          ₱{activeBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
}

// ── New Transaction Modal ────────────────────────────────────────────────────
function NewTransactionModal({ visible, onClose, onAdd }) {
  const [name, setName]     = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCat]  = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name || !amount) {
      Alert.alert('Missing fields', 'Please enter a name and amount.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/transactions', {
        merchant: name,
        amount:   -Math.abs(parseFloat(amount)), // expenses are negative
        category: category || 'Uncategorized',
        source:   source   || 'manual',
      });
      onAdd(res.data);
      setName(''); setAmount(''); setCat(''); setSource('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <Text style={modal.title}>New Transaction</Text>

          <Text style={modal.label}>Merchant / Description</Text>
          <TextInput style={modal.input} placeholder="e.g. GrabFood" value={name} onChangeText={setName} />

          <Text style={modal.label}>Amount (₱)</Text>
          <TextInput style={modal.input} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />

          <Text style={modal.label}>Category</Text>
          <TextInput style={modal.input} placeholder="e.g. Dining, Transport" value={category} onChangeText={setCat} />

          <Text style={modal.label}>Payment Source</Text>
          <TextInput style={modal.input} placeholder="e.g. GCash, Maya, Cash" value={source} onChangeText={setSource} />

          <TouchableOpacity style={[modal.addBtn, loading && { opacity: 0.7 }]} onPress={handleAdd} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={modal.addBtnText}>Add Transaction</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
            <Text style={modal.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Dashboard Screen ─────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [modalVisible, setModal]      = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/api/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, []);

  const handleAdd = (newTx) => {
    if (!data) return;
    setData(prev => ({
      ...prev,
      recent: [newTx, ...prev.recent].slice(0, 5),
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#0D2B2B" />
        </View>
      </SafeAreaView>
    );
  }

  const monthlySpend     = data?.monthlySpend     || Array(9).fill(0);
  const currentSpend     = data?.currentMonthTotal || 0;
  const lastMonthSpend   = data?.lastMonthTotal    || 0;
  const activeBudget     = data?.activeBudget      || 0;
  const recent           = data?.recent            || [];

  const pctChange = lastMonthSpend > 0
    ? (((currentSpend - lastMonthSpend) / lastMonthSpend) * 100).toFixed(0)
    : 0;
  const isLess = currentSpend < lastMonthSpend;

  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' }).toUpperCase();

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboard(true)} tintColor="#0D2B2B" />}
      >
        {/* ── Total Spend Card ── */}
        <View style={s.spendCard}>
          <Text style={s.spendLabel}>TOTAL SPEND ({monthName})</Text>
          <Text style={s.spendAmount}>
            ₱{currentSpend.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
          {lastMonthSpend > 0 && (
            <View style={s.changeRow}>
              <Ionicons
                name={isLess ? 'trending-down' : 'trending-up'}
                size={16}
                color={isLess ? '#2ECC71' : '#E74C3C'}
              />
              <Text style={[s.changeText, { color: isLess ? '#2ECC71' : '#E74C3C' }]}>
                {' '}{Math.abs(pctChange)}% {isLess ? 'less' : 'more'} than last month
              </Text>
            </View>
          )}
          <BarChart data={monthlySpend} activeBudget={activeBudget} />
        </View>

        {/* ── Quick Manual Entry Card ── */}
        <View style={s.entryCard}>
          <TouchableOpacity style={s.plusBtn} onPress={() => setModal(true)}>
            <Ionicons name="add-circle-outline" size={28} color="#A8D8D8" />
          </TouchableOpacity>
          <Text style={s.entryTitle}>Quick Manual Entry</Text>
          <Text style={s.entrySub}>Log cash expenses instantly to keep your balance precise.</Text>
          <TouchableOpacity style={s.newTxBtn} onPress={() => setModal(true)}>
            <Text style={s.newTxText}>New Transaction  →</Text>
          </TouchableOpacity>
        </View>

        {/* ── AI Assistant Tip ── */}
        <View style={s.aiRow}>
          <View style={s.aiIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0D2B2B" />
          </View>
          <View style={s.aiText}>
            <Text style={s.aiTitle}>AI Assistant</Text>
            <Text style={s.aiSub}>
              "Your dining expenses are 15% higher this week. Consider exploring your meal prep history."
            </Text>
          </View>
        </View>

        {/* ── Recent Activity ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={s.viewAll}>View All  ›</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <View style={s.emptyTx}>
            <Text style={s.emptyTxText}>No transactions yet. Add one above.</Text>
          </View>
        ) : (
          recent.map(tx => {
            const isIncome = tx.amount > 0;
            return (
              <View key={tx.id} style={s.txRow}>
                <View style={[s.txIcon, { backgroundColor: '#0D2B2B20' }]}>
                  <Ionicons name="receipt-outline" size={20} color="#0D2B2B" />
                </View>
                <View style={s.txInfo}>
                  <Text style={s.txName}>{tx.merchant}</Text>
                  <Text style={s.txSub}>{tx.source} · {tx.category}</Text>
                </View>
                <View style={s.txRight}>
                  <Text style={[s.txAmount, { color: isIncome ? '#2ECC71' : '#E74C3C' }]}>
                    {isIncome ? '+' : '-'}₱{Math.abs(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={s.txDate}>
                    {new Date(tx.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <NewTransactionModal
        visible={modalVisible}
        onClose={() => setModal(false)}
        onAdd={handleAdd}
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F7F8FA' },
  scroll:  { paddingHorizontal: 16, paddingBottom: 24 },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  appName:    { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },

  spendCard:   { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  spendLabel:  { fontSize: 11, color: '#888', letterSpacing: 0.5, marginBottom: 4 },
  spendAmount: { fontSize: 32, fontWeight: '800', color: '#0D2B2B' },
  changeRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12 },
  changeText:  { fontSize: 13 },

  entryCard:  { backgroundColor: '#0D2B2B', borderRadius: 16, padding: 20, marginBottom: 16 },
  plusBtn:    { marginBottom: 8 },
  entryTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  entrySub:   { fontSize: 13, color: '#A8C8C8', marginBottom: 60 },
  newTxBtn:   { backgroundColor: '#A8E8E8', borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  newTxText:  { fontSize: 15, fontWeight: '600', color: '#0D2B2B' },

  aiRow:  { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  aiIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F4F4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiText: { flex: 1 },
  aiTitle:{ fontSize: 15, fontWeight: '700', color: '#0D2B2B', marginBottom: 4 },
  aiSub:  { fontSize: 12, color: '#666', lineHeight: 18 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { fontSize: 17, fontWeight: '700', color: '#0D2B2B' },
  viewAll:       { fontSize: 13, color: '#0D2B2B', fontWeight: '600' },

  txRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  txIcon:  { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txInfo:  { flex: 1 },
  txName:  { fontSize: 14, fontWeight: '600', color: '#0D2B2B' },
  txSub:   { fontSize: 12, color: '#888', marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount:{ fontSize: 14, fontWeight: '700' },
  txDate:  { fontSize: 11, color: '#AAA', marginTop: 2 },

  emptyTx:     { alignItems: 'center', paddingVertical: 24 },
  emptyTxText: { fontSize: 14, color: '#AAA' },
});

const chart = StyleSheet.create({
  wrapper:     { marginTop: 8 },
  bars:        { flexDirection: 'row', alignItems: 'flex-end', height: 90, marginBottom: 4 },
  barCol:      { alignItems: 'center', marginHorizontal: 3 },
  bar:         { borderRadius: 4 },
  barActive:   { backgroundColor: '#0D2B2B' },
  barInactive: { backgroundColor: '#C8DCDC' },
  label:       { fontSize: 9, color: '#AAA', marginTop: 4 },
  budgetRow:   { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 6, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8 },
  budgetLabel: { fontSize: 10, color: '#888', marginRight: 6, letterSpacing: 0.4 },
  budgetValue: { fontSize: 13, fontWeight: '700', color: '#0D2B2B' },
});

const modal = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  title:      { fontSize: 20, fontWeight: '700', color: '#0D2B2B', marginBottom: 20 },
  label:      { fontSize: 13, color: '#555', marginBottom: 6 },
  input:      { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 14 },
  addBtn:     { backgroundColor: '#0D2B2B', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn:  { alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: '#888', fontSize: 14 },
});
