import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { loginAPI, verifyLoginOtpAPI, checkAuthAPI, sendOtpAPI } from '@/api/auth.api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewState = "login" | "2fa";

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [view, setView] = useState<ViewState>("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA states
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  
  const { setUser } = useAuthStore();
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  };

  // Timer logic for OTP
  useEffect(() => {
    let timer: any;
    if (view === '2fa' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, view]);

  const handleLogin = async () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }
    
    try {
      setLoading(true);
      const res = await loginAPI(email, password);
      if (res.requiresOtp) {
        setView("2fa");
        setTimeLeft(300); // Reset timer
      } else {
        if (res.token) {
          await SecureStore.setItemAsync('userToken', res.token);
          const userData = await checkAuthAPI();
          setUser(userData);
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      if (!error.response) {
        setErrorMsg("Không thể kết nối đến máy chủ.");
        return;
      }
      if (error.response?.status === 403) {
        try {
          await sendOtpAPI(email);
          setView("2fa");
          setTimeLeft(300);
        } catch (e) {
          setErrorMsg("Tài khoản chưa xác thực và không thể gửi lại mã OTP.");
        }
      } else if (error.response?.status === 202) {
        setView("2fa");
        setTimeLeft(300);
      } else {
        setErrorMsg(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg("");
    if (!otp || otp.length !== 6) {
      setErrorMsg("Vui lòng nhập đủ 6 chữ số mã xác thực.");
      return;
    }
    
    try {
      setLoading(true);
      const res = await verifyLoginOtpAPI(email, otp);
      if (res.token) {
        await SecureStore.setItemAsync('userToken', res.token);
        const userData = await checkAuthAPI();
        setUser(userData);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    setErrorMsg("");
    try {
      setLoading(true);
      await sendOtpAPI(email);
      setTimeLeft(300); // reset timer
      Alert.alert("Thành công", "Đã gửi lại mã OTP");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Không thể gửi lại mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" bounces={false}>
        
        <View style={styles.headerBackground}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Login</Text>
              <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerContent}>
              {view === 'login' ? (
                <Text style={styles.headerSubtitle}>Enter your{'\n'}account and password</Text>
              ) : (
                <View>
                  <Text style={styles.headerSubtitle}>Enter OTP Code</Text>
                  <Text style={styles.headerSmallText}>Sent to : {email}</Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {view === 'login' && (
            <View style={styles.form}>
              <Text style={styles.formHint}>Please enter your details below.</Text>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Email or Username"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Password"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#A0A0A0" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.actionRow}>
                <View />
                <TouchableOpacity 
                  style={[styles.circularButton, loading && styles.buttonDisabled]} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-forward" size={24} color="#fff" />}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {view === '2fa' && (
            <View style={styles.form}>
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={16} color="#A0A0A0" />
                <Text style={styles.timerText}>
                  {formatTime(timeLeft)}
                </Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={timeLeft > 0 || loading}>
                  <Text style={[styles.resendText, timeLeft > 0 && styles.resendTextDisabled]}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.otpContainer}>
                {[...Array(6)].map((_, i) => (
                  <View key={i} style={[styles.otpBox, otp.length === i && styles.otpBoxActive]}>
                    <Text style={styles.otpText}>{otp[i] || ''}</Text>
                  </View>
                ))}
                <TextInput
                  style={styles.hiddenInput}
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.backLink} 
                  onPress={() => { setView('login'); setErrorMsg(""); setOtp(""); }}
                  disabled={loading}
                >
                  <Text style={styles.backLinkText}>Change email</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.circularButton, loading && styles.buttonDisabled]} 
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-forward" size={24} color="#fff" />}
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerBackground: {
    backgroundColor: '#00A3FF',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: 40,
    // Add shadow for better curve effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  registerButtonText: {
    color: '#00A3FF',
    fontWeight: '600',
    fontSize: 14,
  },
  headerContent: {
    paddingHorizontal: 24,
    marginTop: 30,
  },
  headerSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  headerSmallText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  formHint: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    padding: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00A3FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  
  // OTP Styles
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timerText: {
    marginLeft: 6,
    marginRight: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  resendText: {
    fontSize: 14,
    color: '#00A3FF',
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#A0A0A0',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: 40,
  },
  otpBox: {
    width: width / 8,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderBottomColor: '#00A3FF',
  },
  otpText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  backLink: {
    padding: 10,
  },
  backLinkText: {
    color: '#666',
    fontSize: 14,
  }
});
