import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      // Save token with error handling
      try {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      } catch (storageError) {
        console.warn('Could not save to AsyncStorage:', storageError.message);
        // Continue anyway - token will be in memory
      }
      
      // Navigate to main app — replace so user can't go back to login
      navigation.replace('MainApp');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Background circles */}
      <View style={[s.circle, s.circleTopLeft]} />
      <View style={[s.circle, s.circleTopMid]} />
      <View style={[s.circle, s.circleBottomRight]} />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={s.logoRow}>
            <View style={s.logoIcon}>
              <Ionicons name="receipt-outline" size={20} color="#0D2B2B" />
            </View>
            <Text style={s.logoText}>GastoTrack</Text>
          </View>

          {/* ── Card ── */}
          <View style={s.card}>
            <Text style={s.title}>Welcome Back</Text>
            <Text style={s.subtitle}>
              Log in to master your financial destiny with AI precision.
            </Text>

            {/* Email */}
            <Text style={s.label}>Email Address</Text>
            <View style={s.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#AAA" style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="name@company.com"
                placeholderTextColor="#BBB"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View style={s.passwordHeader}>
              <Text style={s.label}>Password</Text>
              <TouchableOpacity>
                <Text style={s.forgot}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <View style={s.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#AAA" style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor="#BBB"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={s.eyeBtn}>
                <Ionicons
                  name={showPass ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#AAA"
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[s.loginBtn, loading && s.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.loginBtnText}>Log In  →</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>OR CONTINUE WITH</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={s.socialRow}>
              <TouchableOpacity style={s.socialBtn}>
                <Text style={s.socialIcon}>G</Text>
                <Text style={s.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialBtn}>
                <View style={s.fbIcon}>
                  <Text style={s.fbLetter}>f</Text>
                </View>
                <Text style={s.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Register */}
            <View style={s.registerRow}>
              <Text style={s.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.registerLink}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={s.footer}>
            © 2024 GastoTrack AI. Secure end-to-end encrypted financial management.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#E8EEEE' },
  flex:  { flex: 1 },
  scroll:{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },

  // Background circles
  circle:          { position: 'absolute', borderRadius: 999, backgroundColor: '#C8D8D8', opacity: 0.5 },
  circleTopLeft:   { width: 80,  height: 80,  top: 60,  left: -20 },
  circleTopMid:    { width: 20,  height: 20,  top: 130, left: 120 },
  circleBottomRight:{ width: 100, height: 100, bottom: 100, right: -20 },

  // Logo
  logoRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 32, gap: 8 },
  logoIcon: { width: 36, height: 36, borderRadius: 8, borderWidth: 2, borderColor: '#0D2B2B', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '700', color: '#0D2B2B' },

  // Card
  card:     { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16 },
  title:    { fontSize: 26, fontWeight: '800', color: '#0D2B2B', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  // Labels
  label:          { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot:         { fontSize: 13, fontWeight: '600', color: '#0D7B7B' },

  // Input
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#FAFAFA' },
  inputIcon:    { marginRight: 8 },
  input:        { flex: 1, fontSize: 15, color: '#333', paddingVertical: 14 },
  eyeBtn:       { padding: 4 },

  // Login button
  loginBtn:         { backgroundColor: '#0D2B2B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 20 },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Divider
  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E8E8' },
  dividerText: { fontSize: 11, color: '#AAA', marginHorizontal: 10, letterSpacing: 0.5 },

  // Social
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingVertical: 12, gap: 8, backgroundColor: '#fff' },
  socialIcon:{ fontSize: 16, fontWeight: '800', color: '#555' },
  socialText:{ fontSize: 14, fontWeight: '600', color: '#333' },
  fbIcon:    { width: 20, height: 20, borderRadius: 4, backgroundColor: '#1877F2', justifyContent: 'center', alignItems: 'center' },
  fbLetter:  { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Register
  registerRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 13, color: '#888' },
  registerLink: { fontSize: 13, fontWeight: '700', color: '#0D2B2B' },

  // Footer
  footer: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 24, lineHeight: 18 },
});
