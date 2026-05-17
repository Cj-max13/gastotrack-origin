import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SectionList, ActivityIndicator, RefreshControl, Modal, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

// ── Constants ────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'GCash', 'Maya', 'Cash', 'Food', 'Travel', 'Shopping', 'Health', 'Entertainment'];

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

// Map category/source keywords to icons and colors
const ICON_MAP = {
  'food':            { icon: 'fast-food-outline',          color: '#E74C3C' },
  'groceries':       { icon: 'cart-outline',               color: '#27AE60' },
  'transport':       { icon: 'car-outline',                color: '#E67E22' },
  'entertainment':   { icon: 'film-outline',               color: '#9B59B6' },
  'utilities':       { icon: 'flash-outline',              color: '#3498DB' },
  'shopping':        { icon: 'bag-outline',                color: '#EE4D2D' },
  'health':          { icon: 'medkit-outline',             color: '#2ECC71' },
  'education':       { icon: 'school-outline',             color: '#9B59B6' },
  'travel':          { icon: 'airplane-outline',           color: '#3498DB' },
  'rent':            { icon: 'home-outline',               color: '#34495E' },
  'insurance':       { icon: 'shield-checkmark-outline',   color: '#16A085' },
  'fitness':         { icon: 'barbell-outline',            color: '#E67E22' },
  'beauty':          { icon: 'cut-outline',                color: '#E91E63' },
  'clothing':        { icon: 'shirt-outline',              color: '#9C27B0' },
  'electronics':     { icon: 'phone-portrait-outline',     color: '#607D8B' },
  'gifts':           { icon: 'gift-outline',               color: '#F39C12' },
  'pets':            { icon: 'paw-outline',                color: '#8E44AD' },
  'bills':           { icon: 'receipt-outline',            color: '#C0392B' },
  'internet':        { icon: 'wifi-outline',               color: '#2980B9' },
  'phone':           { icon: 'call-outline',               color: '#27AE60' },
  'subscriptions':   { icon: 'repeat-outline',             color: '#E74C3C' },
  'coffee':          { icon: 'cafe-outline',               color: '#795548' },
  'restaurants':     { icon: 'restaurant-outline',         color: '#FF5722' },
  'dining':          { icon: 'restaurant-outline',         color: '#FF5722' },
  'drinks':          { icon: 'cafe-outline',               color: '#795548' },
  'gas':             { icon: 'speedometer-outline',        color: '#FF9800' },
  'parking':         { icon: 'car-sport-outline',          color: '#9E9E9E' },
  'taxi':            { icon: 'car-outline',                color: '#FFC107' },
  'ride':            { icon: 'car-outline',                color: '#FFC107' },
  'books':           { icon: 'book-outline',               color: '#5D4037' },
  'hobbies':         { icon: 'game-controller-outline',    color: '#673AB7' },
  'sports':          { icon: 'football-outline',           color: '#4CAF50' },
  'streaming':       { icon: 'tv-outline',                 color: '#E91E63' },
  'gaming':          { icon: 'game-controller-outline',    color: '#9C27B0' },
  'charity':         { icon: 'heart-outline',              color: '#E91E63' },
  'savings':         { icon: 'wallet-outline',             color: '#4CAF50' },
  'investments':     { icon: 'trending-up-outline',        color: '#009688' },
  'loans':           { icon: 'card-outline',               color: '#F44336' },
  'taxes':           { icon: 'document-text-outline',      color: '#607D8B' },
  'childcare':       { icon: 'happy-outline',              color: '#FF9800' },
  'home':            { icon: 'hammer-outline',             color: '#795548' },
  'maintenance':     { icon: 'hammer-outline',             color: '#795548' },
  'furniture':       { icon: 'bed-outline',                color: '#8D6E63' },
  'laundry':         { icon: 'water-outline',              color: '#00BCD4' },
  'personal':        { icon: 'person-outline',             color: '#E91E63' },
  'medical':         { icon: 'medical-outline',            color: '#F44336' },
  'pharmacy':        { icon: 'bandage-outline',            color: '#4CAF50' },
  'office':          { icon: 'briefcase-outline',          color: '#607D8B' },
  'income':          { icon: 'cash-outline',               color: '#2ECC71' },
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

// ── Edit Transaction Modal ───────────────────────────────────────────────────
function EditTransactionModal({ visible, transaction, onClose, onSave }) {
  const [merchant, setMerchant]     = useState('');
  const [amount, setAmount]         = useState('');
  const [category, setCategory]     = useState(CATEGORY_OPTIONS[0]);
  const [source, setSource]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (transaction) {
      setMerchant(transaction.merchant || '');
      setAmount(Math.abs(transaction.amount).toString());
      const foundCat = CATEGORY_OPTIONS.find(c => c.label === transaction.category);
      setCategory(foundCat || CATEGORY_OPTIONS[0]);
      setSource(transaction.source || '');
    }
  }, [transaction]);

  const handleSave = async () => {
    if (!merchant || !amount) {
      Alert.alert('Missing fields', 'Please enter merchant and amount.');
      return;
    }
    setLoading(true);
    try {
      const isIncome = transaction.amount > 0;
      const res = await api.put(`/api/transactions/${transaction.id}`, {
        merchant,
        amount: isIncome ? Math.abs(parseFloat(amount)) : -Math.abs(parseFloat(amount)),
        category: category.label,
        source: source || 'manual',
      });
      onSave(res.data);
      onClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update transaction.');
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.header}>
            <Text style={modal.title}>Edit Transaction</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#0D2B2B" />
            </TouchableOpacity>
          </View>

          <Text style={modal.label}>Merchant / Description</Text>
          <TextInput 
            style={modal.input} 
            placeholder="e.g. GrabFood" 
            value={merchant} 
            onChangeText={setMerchant} 
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
          <TouchableOpacity style={modal.picker} onPress={() => setShowPicker(p => !p)}>
            <View style={[modal.pickerIcon, { backgroundColor: category.color + '18' }]}>
              <Ionicons name={category.icon} size={18} color={category.color} />
            </View>
            <Text style={modal.pickerText}>{category.label}</Text>
            <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color="#AAA" />
          </TouchableOpacity>

          {showPicker && (
            <ScrollView style={modal.dropdownList} nestedScrollEnabled>
              {CATEGORY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.label}
                  style={modal.dropdownItem}
                  onPress={() => { setCategory(opt); setShowPicker(false); }}
                >
                  <View style={[modal.pickerIcon, { backgroundColor: opt.color + '18' }]}>
                    <Ionicons name={opt.icon} size={16} color={opt.color} />
                  </View>
                  <Text style={modal.dropdownText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={modal.label}>Payment Source</Text>
          <TextInput 
            style={modal.input} 
            placeholder="e.g. GCash, Maya, Cash" 
            value={source} 
            onChangeText={setSource} 
          />

          <TouchableOpacity 
            style={[modal.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={modal.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
            <Text style={modal.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Transaction Row ──────────────────────────────────────────────────────────
function TransactionRow({ item, onEdit, onDelete }) {
  const isIncome = item.amount > 0;
  const { icon, color } = getIconForCategory(item.category);

  return (
    <TouchableOpacity 
      style={s.txRow}
      onPress={() => onEdit(item)}
      onLongPress={() =>
        Alert.alert(
          'Delete Transaction',
          `Remove "${item.merchant}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
          ]
        )
      }
      activeOpacity={0.7}
    >
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
    </TouchableOpacity>
  );
}

// ── History Screen ───────────────────────────────────────────────────────────
export default function HistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [activeFilter, setFilter]       = useState('All');
  const [editModalVisible, setEditModal] = useState(false);
  const [selectedTransaction, setSelectedTx] = useState(null);

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

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTransactions(true);
    });
    return unsubscribe;
  }, [navigation]);

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

  const handleEdit = (transaction) => {
    setSelectedTx(transaction);
    setEditModal(true);
  };

  const handleSave = (updatedTx) => {
    setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
    setEditModal(false);
    setSelectedTx(null);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete transaction.');
    }
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
          renderItem={({ item }) => <TransactionRow item={item} onEdit={handleEdit} onDelete={handleDelete} />}
        />
      )}

      <EditTransactionModal
        visible={editModalVisible}
        transaction={selectedTransaction}
        onClose={() => { setEditModal(false); setSelectedTx(null); }}
        onSave={handleSave}
      />
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

const modal = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:        { fontSize: 20, fontWeight: '700', color: '#0D2B2B' },
  label:        { fontSize: 13, color: '#555', marginBottom: 6, marginTop: 8 },
  input:        { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 8 },
  picker:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 8 },
  pickerIcon:   { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  pickerText:   { flex: 1, fontSize: 15, color: '#333' },
  dropdownList: { borderWidth: 1, borderColor: '#EEE', borderRadius: 10, marginBottom: 16, maxHeight: 200, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownText: { fontSize: 14, color: '#333', marginLeft: 8 },
  saveBtn:      { backgroundColor: '#0D2B2B', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16, marginBottom: 10 },
  saveBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn:    { alignItems: 'center', paddingVertical: 10 },
  cancelText:   { color: '#888', fontSize: 14 },
});
