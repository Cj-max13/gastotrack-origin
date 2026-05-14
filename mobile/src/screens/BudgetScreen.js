import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ── Initial Budget Data ───────────────────────────────────────────────────────
const INITIAL_BUDGETS = [
  { id: 1, category: 'Groceries',     icon: 'cart-outline',            color: '#E74C3C', spent: 515.20, limit: 500.00  },
  { id: 2, category: 'Transport',     icon: 'car-outline',             color: '#E67E22', spent: 255.00, limit: 300.00  },
  { id: 3, category: 'Entertainment', icon: 'film-outline',            color: '#0D2B2B', spent: 120.00, limit: 400.00  },
  { id: 4, category: 'Utilities',     icon: 'flash-outline',           color: '#0D2B2B', spent: 180.00, limit: 250.00  },
];

const CATEGORY_OPTIONS = [
  { label: 'Food & Drinks',   icon: 'fast-food-outline',      color: '#E74C3C' },
  { label: 'Groceries',       icon: 'cart-outline',           color: '#E74C3C' },
  { label: 'Transport',       icon: 'car-outline',            color: '#E67E22' },
  { label: 'Entertainment',   icon: 'film-outline',           color: '#9B59B6' },
  { label: 'Utilities',       icon: 'flash-outline',          color: '#3498DB' },
  { label: 'Shopping',        icon: 'bag-outline',            color: '#EE4D2D' },
  { label: 'Health',          icon: 'medkit-outline',         color: '#2ECC71' },
  { label: 'Education',       icon: 'school-outline',         color: '#9B59B6' },
  { label: 'Travel',          icon: 'airplane-outline',       color: '#3498DB' },
  { label: 'Other',           icon: 'ellipsis-horizontal-outline', color: '#888' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStatus(spent, limit) {
  const pct = spent / limit;
  if (pct > 1)    return { label: `Over by ₱${(spent - limit).toFixed(2)}`, color: '#E74C3C', barColor: '#E74C3C' };
  if (pct >= 0.8) return { label: '85% Limit',  color: '#E67E22', barColor: '#E67E22' };
  return              { label: 'Healthy',      color: '#0D7B7B', barColor: '#0D2B2B' };
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
  const status = getStatus(item.spent, item.limit);
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
        <View style={[bc.icon, { backgroundColor: item.color + '18' }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <View style={bc.info}>
          <Text style={bc.name}>{item.category}</Text>
          <Text style={bc.sub}>
            ₱{item.spent.toFixed(2)} / ₱{item.limit.toFixed(2)} used
          </Text>
        </View>
        <Text style={[bc.status, { color: status.color }]}>{status.label}</Text>
      </View>
      <ProgressBar spent={item.spent} limit={item.limit} barColor={status.barColor} />
    </TouchableOpacity>
  );
}

// ── Add Budget Modal ──────────────────────────────────────────────────────────
function AddBudgetModal({ visible, onClose, onAdd }) {
  const [selected, setSelected] = useState(CATEGORY_OPTIONS[0]);
  const [limit, setLimit]       = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleAdd = () => {
    if (!limit || isNaN(parseFloat(limit))) {
      Alert.alert('Invalid amount', 'Please enter a valid budget limit.');
      return;
    }
    onAdd({
      id:       Date.now(),
      category: selected.label,
      icon:     selected.icon,
      color:    selected.color,
      spent:    0,
      limit:    parseFloat(limit),
    });
    setLimit('');
    setSelected(CATEGORY_OPTIONS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <Text style={modal.title}>New Budget</Text>

          {/* Category picker */}
          <Text style={modal.label}>Category</Text>
          <TouchableOpacity style={modal.picker} onPress={() => setShowPicker(p => !p)}>
            <View style={[modal.pickerIcon, { backgroundColor: selected.color + '18' }]}>
              <Ionicons name={selected.icon} size={18} color={selected.color} />
            </View>
            <Text style={modal.pickerText}>{selected.label}</Text>
            <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color="#AAA" />
          </TouchableOpacity>

          {showPicker && (
            <View style={modal.dropdownList}>
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
            </View>
          )}

          {/* Limit amount */}
          <Text style={modal.label}>Monthly Limit (₱)</Text>
          <TextInput
            style={modal.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={limit}
            onChangeText={setLimit}
          />

          <TouchableOpacity style={modal.addBtn} onPress={handleAdd}>
            <Text style={modal.addBtnText}>Add Budget</Text>
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
export default function BudgetScreen() {
  const [budgets, setBudgets]     = useState(INITIAL_BUDGETS);
  const [modalVisible, setModal]  = useState(false);

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent    = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining     = totalBudgeted - totalSpent;

  const handleAdd = (newBudget) => {
    setBudgets(prev => [...prev, newBudget]);
  };

  const handleDelete = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
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

        {/* ── AI Budget Analysis ── */}
        <View style={s.aiCard}>
          <View style={s.aiIconWrap}>
            <Ionicons name="hardware-chip-outline" size={22} color="#A8D8D8" />
          </View>
          <View style={s.aiContent}>
            <Text style={s.aiTitle}>AI Budget Analysis</Text>
            <Text style={s.aiMsg}>
              You're on track to overspend in 'Groceries' by ₱45 this month.
              Consider reducing 'Dining Out' to compensate.
            </Text>
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
          <TouchableOpacity>
            <Text style={s.editAll}>Edit All ✎</Text>
          </TouchableOpacity>
        </View>

        {budgets.map(item => (
          <BudgetCard key={item.id} item={item} onDelete={handleDelete} />
        ))}

        {budgets.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="wallet-outline" size={48} color="#CCC" />
            <Text style={s.emptyText}>No budgets yet. Tap + to add one.</Text>
          </View>
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
  safe:   { flex: 1, backgroundColor: '#F7F8FA' },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  // Header
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  appName:    { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },

  // AI card
  aiCard:     { backgroundColor: '#0D2B2B', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  aiIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1A3F3F', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiContent:  { flex: 1 },
  aiTitle:    { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  aiMsg:      { fontSize: 13, color: '#A8C8C8', lineHeight: 20 },

  // Summary
  summaryRow:   { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard:  { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  summaryLabel: { fontSize: 10, color: '#888', letterSpacing: 0.5, marginBottom: 6 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#0D2B2B' },

  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },
  editAll:       { fontSize: 13, fontWeight: '600', color: '#0D7B7B' },

  // Empty
  empty:     { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: '#AAA' },

  // FAB
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
