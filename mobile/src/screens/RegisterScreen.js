import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../utils';

export default function RegisterScreen({ navigation }) {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (!agreed) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      console.error('Registration error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      const msg = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Background decorative circles */}
      <View style={[s.circle, s.c1]} />
      <View style={[s.circle, s.c2]} />
      <View style={[s.circle, s.c3]} />
      <View style={[s.circle, s.c4]} />
      <View style={[s.dot, s.d1]} />
      <View style={[s.dot, s.d2]} />
      <View style={[s.dot, s.d3]} />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <Text style={s.title}>Create an account</Text>
          <Text style={s.subtitle}>
            Join GastoTrack and take control of your future.
          </Text>

          {/* Full Name */}
          <Text style={s.label}>Full Name</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#AAA" style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="John Doe"
              placeholderTextColor="#BBB"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

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
          <Text style={s.label}>Password</Text>
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
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#AAA" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={s.label}>Confirm Password</Text>
          <View style={s.inputWrapper}>
            <Ionicons name="shield-outline" size={18} color="#AAA" style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor="#BBB"
              secureTextEntry={!showConf}
              value={confirm}
              onChangeText={setConfirm}
            />
            <TouchableOpacity onPress={() => setShowConf(p => !p)} style={s.eyeBtn}>
              <Ionicons name={showConf ? 'eye-outline' : 'eye-off-outline'} size={20} color="#AAA" />
            </TouchableOpacity>
          </View>

          {/* Terms checkbox */}
          <TouchableOpacity style={s.checkRow} onPress={() => setAgreed(p => !p)} activeOpacity={0.7}>
            <View style={[s.checkbox, agreed && s.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={s.checkText}>
              I agree to the{' '}
              <Text style={s.checkLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={s.checkLink}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[s.signupBtn, loading && s.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.signupBtnText}>Sign Up</Text>
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
              <Text style={s.googleG}>G</Text>
              <Text style={s.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <View style={s.liIcon}>
                <Ionicons name="logo-linkedin" size={16} color="#fff" />
              </View>
              <Text style={s.socialText}>LinkedIn</Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={s.loginRow}>
            <Text style={s.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={s.loginLink}>Log in instead</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#EDF1F1' },
  flex:  { flex: 1 },
  scroll:{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },

  // Decorative circles
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: '#C5D5D5', opacity: 0.45 },
  c1: { width: 120, height: 120, top: -30,  left: -40 },
  c2: { width: 80,  height: 80,  top: 80,   right: -20 },
  c3: { width: 100, height: 100, bottom: 120, left: -30 },
  c4: { width: 140, height: 140, bottom: -40, right: -40 },

  // Decorative dots
  dot: { position: 'absolute', borderRadius: 999, backgroundColor: '#A0B8B8', opacity: 0.5 },
  d1: { width: 12, height: 12, top: 160, left: 60 },
  d2: { width: 8,  height: 8,  top: 300, right: 40 },
  d3: { width: 10, height: 10, bottom: 200, right: 80 },

  // Header
  title:    { fontSize: 30, fontWeight: '800', color: '#0D2B2B', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 28 },

  // Labels & inputs
  label:        { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDE3E3', borderRadius: 10, paddingHorizontal: 12, marginBottom: 18, backgroundColor: '#F9FBFB' },
  inputIcon:    { marginRight: 8 },
  input:        { flex: 1, fontSize: 15, color: '#333', paddingVertical: 14 },
  eyeBtn:       { padding: 4 },

  // Checkbox
  checkRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22, gap: 10 },
  checkbox:     { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#AAA', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxActive:{ backgroundColor: '#0D2B2B', borderColor: '#0D2B2B' },
  checkText:    { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
  checkLink:    { fontWeight: '700', color: '#0D2B2B' },

  // Sign up button
  signupBtn:     { backgroundColor: '#0D2B2B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  btnDisabled:   { opacity: 0.7 },
  signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Divider
  dividerRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#D8E0E0' },
  dividerText: { fontSize: 11, color: '#AAA', marginHorizontal: 10, letterSpacing: 0.5 },

  // Social
  socialRow:  { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDE3E3', borderRadius: 10, paddingVertical: 12, gap: 8, backgroundColor: '#fff' },
  googleG:    { fontSize: 16, fontWeight: '800', color: '#555' },
  socialText: { fontSize: 14, fontWeight: '600', color: '#333' },
  liIcon:     { width: 20, height: 20, borderRadius: 4, backgroundColor: '#0A66C2', justifyContent: 'center', alignItems: 'center' },

  // Login link
  loginRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 13, color: '#888' },
  loginLink: { fontSize: 13, fontWeight: '700', color: '#0D2B2B' },
});
