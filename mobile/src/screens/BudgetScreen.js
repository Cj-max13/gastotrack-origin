import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

// ── Category options ──────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { label: 'Food & Drinks',   icon: 'fast-food-outline',          color: '#E74C3C' },
  { label: 'Groceries',       icon: 'cart-outline',               color: '#27AE60' },
  { label: 'Transport',       icon: 'car-outline',                color: '#E67E22' },
  { label: 'Entertainment',   icon: 'film-outline',               color: '#9B59B6' },
  { label: 'Utilities',       icon: 'flash-outline',              color: '#3498DB' },
  { label: 'Shopping',        icon: 'bag-outline',                color: '#EE4D2D' },
  { label: 'Health',          icon: 'medkit-outline',             color: '#2ECC71' },
  { label: 'Education',       icon: 'school-outline',             color: '#9B59B6' },
  { label: 'Travel',          icon: 'airplane-outline',           color: '#3498DB' },
  { label: 'Rent',            icon: 'home-outline',               color: '#34495E' },
  { label: 'Insurance',       icon: 'shield-checkmark-outline',   color: '#16A085' },
  { label: 'Fitness',         icon: 'barbell-outline',            color: '#E67E22' },
  { label: 'Beauty',          icon: 'cut-outline',                color: '#E91E63' },
  { label: 'Clothing',        icon: 'shirt-outline',              color: '#9C27B0' },
  { label: 'Electronics',     icon: 'phone-portrait-outline',     color: '#607D8B' },
  { label: 'Gifts',           icon: 'gift-outline',               color: '#F39C12' },
  { label: 'Pets',            icon: 'paw-outline',                color: '#8E44AD' },
  { label: 'Bills',           icon: 'receipt-outline',            color: '#C0392B' },
  { label: 'Internet',        icon: 'wifi-outline',               color: '#2980B9' },
  { label: 'Phone',           icon: 'call-outline',               color: '#27AE60' },
  { label: 'Subscriptions',   icon: 'repeat-outline',             color: '#E74C3C' },
  { label: 'Coffee',          icon: 'cafe-outline',               color: '#795548' },
  { label: 'Restaurants',     icon: 'restaurant-outline',         color: '#FF5722' },
  { label: 'Gas',             icon: 'speedometer-outline',        color: '#FF9800' },
  { label: 'Parking',         icon: 'car-sport-outline',          color: '#9E9E9E' },
  { label: 'Taxi/Ride',       icon: 'car-outline',                color: '#FFC107' },
  { label: 'Books',           icon: 'book-outline',               color: '#5D4037' },
  { label: 'Hobbies',         icon: 'game-controller-outline',    color: '#673AB7' },
  { label: 'Sports',          icon: 'football-outline',           color: '#4CAF50' },
  { label: 'Streaming',       icon: 'tv-outline',                 color: '#E91E63' },
  { label: 'Gaming',          icon: 'game-controller-outline',    color: '#9C27B0' },
  { label: 'Charity',         icon: 'heart-outline',              color: '#E91E63' },
  { label: 'Savings',         icon: 'wallet-outline',             color: '#4CAF50' },
  { label: 'Investments',     icon: 'trending-up-outline',        color: '#009688' },
  { label: 'Loans',           icon: 'card-outline',               color: '#F44336' },
  { label: 'Taxes',           icon: 'document-text-outline',      color: '#607D8B' },
  { label: 'Childcare',       icon: 'happy-outline',              color: '#FF9800' },
  { label: 'Home Maintenance',icon: 'hammer-outline',             color: '#795548' },
  { label: 'Furniture',       icon: 'bed-outline',                color: '#8D6E63' },
  { label: 'Laundry',         icon: 'water-outline',              color: '#00BCD4' },
  { label: 'Personal Care',   icon: 'person-outline',             color: '#E91E63' },
  { label: 'Medical',         icon: 'medical-outline',            color: '#F44336' },
  { label: 'Pharmacy',        icon: 'bandage-outline',            color: '#4CAF50' },
  { label: 'Office Supplies', icon: 'briefcase-outline',          color: '#607D8B' },
  { label: 'Other',           icon: 'ellipsis-horizontal-outline',color: '#888'    },
];

function getCategoryMeta(categoryName) {
  const found = CATEGORY_OPTIONS.find(
    c => c.label.toLowerCase() === categoryName?.toLowerCase()
  );
  return found || { icon: 'wallet-outline', color: '#0D2B2B' };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStatus(spent, limit) {
  const pct = spent / limit;
  if (pct > 1)    return { label: `Over by ₱${(spent - limit).toFixed(2)}`, color: '#E74C3C', barColor: '#E74C3C' };
  if (pct >= 0.8) return { label: `${Math.round(pct * 100)}% Limit`,        color: '#E67E22', barColor: '#E67E22' };
  return              { label: 'Healthy',                                    color: '#0D7B7B', barColor: '#0D2B2B' };
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ spent, limit, barColor }) {
  const pct = Math.min(spent / limit, 1) * 100;
  return (
    <View style={pb.bg}>
      <View style={[pb.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
    </View>
  );
}

// ── Budget Card ───────────────────────────────────────────────────────────────
function BudgetCard({ item, onDelete }) {
  const status = getStatus(item.spent, item.limitAmt);
  const meta   = getCategoryMeta(item.category);

  return (
    <TouchableOpacity
      style={bc.card}
      onLongPress={() =>
        Alert.alert('Delete Budget', `Remove "${item.category}" budget?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
        ])
      }
      activeOpacity={0.85}
    >
      <View style={bc.top}>
        <View style={[bc.icon, { backgroundColor: meta.color + '18' }]}>
          <Ionicons name={meta.icon} size={22} color={meta.color} />
        </View>
        <View style={bc.info}>
          <Text style={bc.name}>{item.category}</Text>
          <Text style={bc.sub}>
            ₱{item.spent.toFixed(2)} / ₱{item.limitAmt.toFixed(2)} used
          </Text>
        </View>
        <Text style={[bc.status, { color: status.color }]}>{status.label}</Text>
      </View>
      <ProgressBar spent={item.spent} limit={item.limitAmt} barColor={status.barColor} />
    </TouchableOpacity>
  );
}

// ── Add Budget Modal ──────────────────────────────────────────────────────────
function AddBudgetModal({ visible, onClose, onAdd }) {
  const [selected, setSelected]     = useState(CATEGORY_OPTIONS[0]);
  const [limit, setLimit]           = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleAdd = async () => {
    if (!limit || isNaN(parseFloat(limit))) {
      Alert.alert('Invalid amount', 'Please enter a valid budget limit.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/budgets', {
        category: selected.label,
        limitAmt: parseFloat(limit),
        period:   'monthly',
      });
      onAdd({ ...res.data, spent: 0 });
      setLimit('');
      setSelected(CATEGORY_OPTIONS[0]);
      onClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <Text style={modal.title}>New Budget</Text>

          <Text style={modal.label}>Category</Text>
          <TouchableOpacity style={modal.picker} onPress={() => setShowPicker(p => !p)}>
            <View style={[modal.pickerIcon, { backgroundColor: selected.color + '18' }]}>
              <Ionicons name={selected.icon} size={18} color={selected.color} />
            </View>
            <Text style={modal.pickerText}>{selected.label}</Text>
            <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color="#AAA" />
          </TouchableOpacity>

          {showPicker && (
            <ScrollView style={modal.dropdownList} nestedScrollEnabled>
              {CATEGORY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.label}
                  style={modal.dropdownItem}
                  onPress={() => { setSelected(opt); setShowPicker(false); }}
                >
                  <View style={[modal.pickerIcon, { backgroundColor: opt.color + '18' }]}>
                    <Ionicons name={opt.icon} size={16} color={opt.color} />
                  </View>
                  <Text style={modal.dropdownText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={modal.label}>Monthly Limit (₱)</Text>
          <TextInput
            style={modal.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={limit}
            onChangeText={setLimit}
          />

          <TouchableOpacity style={[modal.addBtn, loading && { opacity: 0.7 }]} onPress={handleAdd} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={modal.addBtnText}>Add Budget</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
            <Text style={modal.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Budget Screen ─────────────────────────────────────────────────────────────
export default function BudgetScreen({ navigation }) {
  const [budgets, setBudgets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModal]    = useState(false);

  const fetchBudgets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/api/budgets');
      setBudgets(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load budgets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBudgets(); }, []);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBudgets(true);
    });
    return unsubscribe;
  }, [navigation]);

  const handleAdd = (newBudget) => {
    setBudgets(prev => [...prev, newBudget]);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/budgets/${id}`);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete budget.');
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.limitAmt, 0);
  const totalSpent    = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const remaining     = totalBudgeted - totalSpent;

  // AI insight based on real data
  const overBudget = budgets.filter(b => b.spent > b.limitAmt);
  const nearLimit  = budgets.filter(b => b.spent / b.limitAmt >= 0.8 && b.spent <= b.limitAmt);
  const aiMsg = overBudget.length > 0
    ? `You've exceeded your budget in ${overBudget.map(b => b.category).join(', ')}. Consider adjusting your spending.`
    : nearLimit.length > 0
    ? `You're close to your limit in ${nearLimit.map(b => b.category).join(', ')}. Monitor your spending carefully.`
    : 'Your budgets are on track this month. Keep it up!';

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#0D2B2B" />
        </View>
      </SafeAreaView>
    );
  }

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchBudgets(true)} tintColor="#0D2B2B" />}
      >
        {/* ── AI Budget Analysis ── */}
        <View style={s.aiCard}>
          <View style={s.aiIconWrap}>
            <Ionicons name="hardware-chip-outline" size={22} color="#A8D8D8" />
          </View>
          <View style={s.aiContent}>
            <Text style={s.aiTitle}>Gasto</Text>
            <Text style={s.aiMsg}>{aiMsg}</Text>
          </View>
        </View>

        {/* ── Summary Cards ── */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>TOTAL BUDGETED</Text>
            <Text style={s.summaryValue}>
              ₱{totalBudgeted.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>REMAINING</Text>
            <Text style={[s.summaryValue, { color: remaining >= 0 ? '#0D7B7B' : '#E74C3C' }]}>
              ₱{Math.abs(remaining).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* ── Active Budgets ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Active Budgets</Text>
        </View>

        {budgets.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="wallet-outline" size={48} color="#CCC" />
            <Text style={s.emptyText}>No budgets yet. Tap + to add one.</Text>
          </View>
        ) : (
          budgets.map(item => (
            <BudgetCard key={item.id} item={item} onDelete={handleDelete} />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={s.fab} onPress={() => setModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddBudgetModal
        visible={modalVisible}
        onClose={() => setModal(false)}
        onAdd={handleAdd}
      />
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

  aiCard:     { backgroundColor: '#0D2B2B', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  aiIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1A3F3F', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiContent:  { flex: 1 },
  aiTitle:    { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  aiMsg:      { fontSize: 13, color: '#A8C8C8', lineHeight: 20 },

  summaryRow:   { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard:  { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  summaryLabel: { fontSize: 10, color: '#888', letterSpacing: 0.5, marginBottom: 6 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#0D2B2B' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },

  empty:     { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: '#AAA' },

  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 },
});

const bc = StyleSheet.create({
  card:   { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  top:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  icon:   { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info:   { flex: 1 },
  name:   { fontSize: 16, fontWeight: '700', color: '#0D2B2B' },
  sub:    { fontSize: 12, color: '#888', marginTop: 2 },
  status: { fontSize: 12, fontWeight: '700' },
});

const pb = StyleSheet.create({
  bg:   { height: 6, backgroundColor: '#E8EEEE', borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});

const modal = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  title:        { fontSize: 20, fontWeight: '700', color: '#0D2B2B', marginBottom: 20 },
  label:        { fontSize: 13, color: '#555', marginBottom: 8 },
  input:        { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 },
  picker:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 8 },
  pickerIcon:   { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  pickerText:   { flex: 1, fontSize: 15, color: '#333' },
  dropdownList: { borderWidth: 1, borderColor: '#EEE', borderRadius: 10, marginBottom: 16, maxHeight: 200, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownText: { fontSize: 14, color: '#333', marginLeft: 8 },
  addBtn:       { backgroundColor: '#0D2B2B', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  addBtnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn:    { alignItems: 'center', paddingVertical: 10 },
  cancelText:   { color: '#888', fontSize: 14 },
});
