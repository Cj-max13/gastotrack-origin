import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ── Mock data ────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
const SPEND_DATA = [12000, 18000, 14000, 22000, 16000, 19000, 21000, 15000, 24580];
const ACTIVE_BUDGET = 35000;
const LAST_MONTH_SPEND = 28000;

const RECENT_TRANSACTIONS = [
  { id: 1, name: 'GrabFood',        sub: 'GCash · Dining',    amount: -450,   date: 'Today, 12:45 PM',    icon: 'fast-food-outline',    color: '#00B14F' },
  { id: 2, name: 'Starbucks',       sub: 'Maya · Lifestyle',  amount: -185,   date: 'Yesterday, 9:20 AM', icon: 'cafe-outline',         color: '#00704A' },
  { id: 3, name: 'Meralco Utilities',sub: 'BPI · Bills',      amount: -3240.5,date: 'Yesterday, 8:00 AM', icon: 'flash-outline',        color: '#0057A8' },
];

// ── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart() {
  const max = Math.max(...SPEND_DATA);
  const barWidth = (width - 80) / SPEND_DATA.length - 6;

  return (
    <View style={chart.wrapper}>
      <View style={chart.bars}>
        {SPEND_DATA.map((val, i) => {
          const isLast = i === SPEND_DATA.length - 1;
          const barHeight = (val / max) * 80;
          return (
            <View key={i} style={chart.barCol}>
              <View
                style={[
                  chart.bar,
                  { height: barHeight, width: barWidth },
                  isLast ? chart.barActive : chart.barInactive,
                ]}
              />
              <Text style={chart.label}>{MONTHS[i]}</Text>
            </View>
          );
        })}
      </View>
      <View style={chart.budgetRow}>
        <Text style={chart.budgetLabel}>ACTIVE BUDGET</Text>
        <Text style={chart.budgetValue}>₱{ACTIVE_BUDGET.toLocaleString()}.00</Text>
      </View>
    </View>
  );
}

// ── New Transaction Modal ────────────────────────────────────────────────────
function NewTransactionModal({ visible, onClose, onAdd }) {
  const [name, setName]     = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCat]  = useState('');

  const handleAdd = () => {
    if (!name || !amount) {
      Alert.alert('Missing fields', 'Please enter a name and amount.');
      return;
    }
    onAdd({ name, amount: parseFloat(amount), category });
    setName(''); setAmount(''); setCat('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <Text style={modal.title}>New Transaction</Text>

          <Text style={modal.label}>Description</Text>
          <TextInput
            style={modal.input}
            placeholder="e.g. GrabFood"
            value={name}
            onChangeText={setName}
          />

          <Text style={modal.label}>Amount (₱)</Text>
          <TextInput
            style={modal.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={modal.label}>Category</Text>
          <TextInput
            style={modal.input}
            placeholder="e.g. Dining, Transport"
            value={category}
            onChangeText={setCat}
          />

          <TouchableOpacity style={modal.addBtn} onPress={handleAdd}>
            <Text style={modal.addBtnText}>Add Transaction</Text>
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
  const [modalVisible, setModalVisible] = useState(false);
  const [transactions, setTransactions] = useState(RECENT_TRANSACTIONS);

  const currentSpend = SPEND_DATA[SPEND_DATA.length - 1];
  const pctChange = (((currentSpend - LAST_MONTH_SPEND) / LAST_MONTH_SPEND) * 100).toFixed(0);
  const isLess = currentSpend < LAST_MONTH_SPEND;

  const handleAdd = (tx) => {
    setTransactions(prev => [
      {
        id: Date.now(),
        name: tx.name,
        sub: tx.category || 'Manual Entry',
        amount: -Math.abs(tx.amount),
        date: 'Just now',
        icon: 'receipt-outline',
        color: '#0D2B2B',
      },
      ...prev,
    ]);
  };

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Total Spend Card ── */}
        <View style={s.spendCard}>
          <Text style={s.spendLabel}>TOTAL SPEND (SEPTEMBER)</Text>
          <Text style={s.spendAmount}>₱{currentSpend.toLocaleString()}.00</Text>
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
          <BarChart />
        </View>

        {/* ── Quick Manual Entry Card ── */}
        <View style={s.entryCard}>
          <TouchableOpacity style={s.plusBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={28} color="#A8D8D8" />
          </TouchableOpacity>
          <Text style={s.entryTitle}>Quick Manual Entry</Text>
          <Text style={s.entrySub}>Log cash expenses instantly to keep your balance precise.</Text>

          <TouchableOpacity style={s.newTxBtn} onPress={() => setModalVisible(true)}>
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
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={s.viewAll}>View All  ›</Text>
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 5).map(tx => (
          <View key={tx.id} style={s.txRow}>
            <View style={[s.txIcon, { backgroundColor: tx.color + '20' }]}>
              <Ionicons name={tx.icon} size={20} color={tx.color} />
            </View>
            <View style={s.txInfo}>
              <Text style={s.txName}>{tx.name}</Text>
              <Text style={s.txSub}>{tx.sub}</Text>
            </View>
            <View style={s.txRight}>
              <Text style={s.txAmount}>₱{Math.abs(tx.amount).toLocaleString()}</Text>
              <Text style={s.txDate}>{tx.date}</Text>
            </View>
          </View>
        ))}

      </ScrollView>

      <NewTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAdd}
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#F7F8FA' },
  scroll:      { paddingHorizontal: 16, paddingBottom: 24 },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:      { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  appName:     { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },

  // Spend card
  spendCard:   { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  spendLabel:  { fontSize: 11, color: '#888', letterSpacing: 0.5, marginBottom: 4 },
  spendAmount: { fontSize: 32, fontWeight: '800', color: '#0D2B2B' },
  changeRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 12 },
  changeText:  { fontSize: 13 },

  // Entry card
  entryCard:   { backgroundColor: '#0D2B2B', borderRadius: 16, padding: 20, marginBottom: 16 },
  plusBtn:     { marginBottom: 8 },
  entryTitle:  { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  entrySub:    { fontSize: 13, color: '#A8C8C8', marginBottom: 60 },
  newTxBtn:    { backgroundColor: '#A8E8E8', borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  newTxText:   { fontSize: 15, fontWeight: '600', color: '#0D2B2B' },

  // AI row
  aiRow:       { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  aiIcon:      { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F4F4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiText:      { flex: 1 },
  aiTitle:     { fontSize: 15, fontWeight: '700', color: '#0D2B2B', marginBottom: 4 },
  aiSub:       { fontSize: 12, color: '#666', lineHeight: 18 },

  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { fontSize: 17, fontWeight: '700', color: '#0D2B2B' },
  viewAll:       { fontSize: 13, color: '#0D2B2B', fontWeight: '600' },

  // Transaction row
  txRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  txIcon:  { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txInfo:  { flex: 1 },
  txName:  { fontSize: 14, fontWeight: '600', color: '#0D2B2B' },
  txSub:   { fontSize: 12, color: '#888', marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount:{ fontSize: 14, fontWeight: '700', color: '#E74C3C' },
  txDate:  { fontSize: 11, color: '#AAA', marginTop: 2 },
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
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  title:       { fontSize: 20, fontWeight: '700', color: '#0D2B2B', marginBottom: 20 },
  label:       { fontSize: 13, color: '#555', marginBottom: 6 },
  input:       { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 },
  addBtn:      { backgroundColor: '#0D2B2B', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  addBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn:   { alignItems: 'center', paddingVertical: 10 },
  cancelText:  { color: '#888', fontSize: 14 },
});
