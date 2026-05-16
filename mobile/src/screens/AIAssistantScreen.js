import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

// ── Suggested prompts ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: 'cafe-outline',         text: 'How much did I spend on coffee this week?' },
  { icon: 'trending-up-outline',  text: 'Am I on track for my savings goal?' },
  { icon: 'receipt-outline',      text: 'Find my largest transaction this month.' },
  { icon: 'bulb-outline',         text: 'Give me tips to reduce utility bills.' },
];

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[bubble.row, isUser ? bubble.rowUser : bubble.rowAI]}>
      {!isUser && (
        <View style={bubble.aiAvatar}>
          <Ionicons name="hardware-chip-outline" size={16} color="#fff" />
        </View>
      )}
      <View style={[bubble.bubble, isUser ? bubble.userBubble : bubble.aiBubble]}>
        <Text style={[bubble.text, isUser ? bubble.userText : bubble.aiText]}>
          {message.content}
        </Text>
        <Text style={[bubble.time, isUser ? bubble.timeUser : bubble.timeAI]}>
          {new Date(message.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animate = useCallback((dot, delay) => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])
    ).start();
  }, []);

  useEffect(() => {
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={typing.row}>
      <View style={typing.avatar}>
        <Ionicons name="hardware-chip-outline" size={16} color="#fff" />
      </View>
      <View style={typing.bubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[typing.dot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </View>
  );
}

// ── AI Assistant Screen ───────────────────────────────────────────────────────
export default function AIAssistantScreen() {
  const [messages, setMessages]   = useState([
    {
      id:        'welcome',
      role:      'assistant',
      content:   "Hello! I've analyzed your transactions from the last 30 days. I'm ready to help you understand your spending patterns, track budgets, and give personalized financial advice. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const listRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;

    setInput('');
    setShowSuggestions(false);

    const userMsg = {
      id:        Date.now().toString(),
      role:      'user',
      content:   userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Build history for multi-turn context (exclude welcome message)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/api/ai/chat', {
        message: userText,
        history,
      });

      const aiMsg = {
        id:        (Date.now() + 1).toString(),
        role:      'assistant',
        content:   res.data.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id:        (Date.now() + 1).toString(),
        role:      'assistant',
        content:   err.response?.data?.error || 'Sorry, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages]);

  const clearChat = () => {
    setMessages([{
      id:        'welcome',
      role:      'assistant',
      content:   "Hello! I've analyzed your transactions from the last 30 days. I'm ready to help you understand your spending patterns, track budgets, and give personalized financial advice. What would you like to know?",
      timestamp: new Date(),
    }]);
    setShowSuggestions(true);
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
        <View style={s.headerRight}>
          <TouchableOpacity onPress={clearChat} style={s.clearBtn}>
            <Ionicons name="refresh-outline" size={20} color="#0D2B2B" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#0D2B2B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero section (shown when no user messages yet) ── */}
      {showSuggestions && (
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Ionicons name="hardware-chip-outline" size={28} color="#fff" />
          </View>
          <Text style={s.heroTitle}>How can I help with your finances today?</Text>
          <Text style={s.heroSub}>
            Your AI assistant is ready to analyze your spending and budgeting patterns.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* ── Messages ── */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* ── Suggestions ── */}
        {showSuggestions && (
          <View style={s.suggestions}>
            {SUGGESTIONS.map((s_, i) => (
              <TouchableOpacity
                key={i}
                style={sug.card}
                onPress={() => sendMessage(s_.text)}
              >
                <Ionicons name={s_.icon} size={18} color="#0D2B2B" style={sug.icon} />
                <Text style={sug.text}>{s_.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input bar ── */}
        <View style={s.inputBar}>
          <TouchableOpacity style={s.attachBtn}>
            <Ionicons name="attach-outline" size={22} color="#888" />
          </TouchableOpacity>
          <TextInput
            style={s.input}
            placeholder="Ask GastoTrack AI..."
            placeholderTextColor="#AAA"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || isTyping) && s.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            {isTyping
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={18} color="#fff" />
            }
          </TouchableOpacity>
        </View>

        <Text style={s.disclaimer}>AI can make mistakes. Verify important financial data.</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F7F8FA' },
  flex:    { flex: 1 },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:      { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  appName:     { fontSize: 18, fontWeight: '700', color: '#0D2B2B' },
  clearBtn:    { padding: 4 },

  hero:     { alignItems: 'center', paddingHorizontal: 32, paddingTop: 8, paddingBottom: 16 },
  heroIcon: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroTitle:{ fontSize: 22, fontWeight: '800', color: '#0D2B2B', textAlign: 'center', marginBottom: 8 },
  heroSub:  { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  messageList: { paddingHorizontal: 16, paddingBottom: 8, flexGrow: 1 },

  suggestions: { paddingHorizontal: 16, paddingBottom: 8 },

  inputBar:    { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE', gap: 8 },
  attachBtn:   { padding: 6 },
  input:       { flex: 1, fontSize: 15, color: '#333', maxHeight: 100, paddingVertical: 8 },
  sendBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#AAA' },

  disclaimer: { fontSize: 11, color: '#BBB', textAlign: 'center', paddingBottom: 6, backgroundColor: '#fff' },
});

const bubble = StyleSheet.create({
  row:        { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  rowUser:    { justifyContent: 'flex-end' },
  rowAI:      { justifyContent: 'flex-start' },
  aiAvatar:   { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
  bubble:     { maxWidth: '78%', borderRadius: 16, padding: 12 },
  userBubble: { backgroundColor: '#0D2B2B', borderBottomRightRadius: 4 },
  aiBubble:   { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  text:       { fontSize: 14, lineHeight: 20 },
  userText:   { color: '#fff' },
  aiText:     { color: '#333' },
  time:       { fontSize: 10, marginTop: 4 },
  timeUser:   { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  timeAI:     { color: '#AAA' },
});

const typing = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  bubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, padding: 14, gap: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  dot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: '#0D2B2B' },
});

const sug = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  icon: { marginRight: 12 },
  text: { fontSize: 14, color: '#333', flex: 1 },
});
