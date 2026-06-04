import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { signupAPI, verifyOtpAPI, checkAuthAPI, sendOtpAPI } from '@/api/auth.api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewState = "register" | "otp";

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const [view, setView] = useState<ViewState>("register");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form states
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP state
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
    if (view === 'otp' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, view]);

  const isPasswordStrong = (pwd: string) => {
    if (!pwd) return false;
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, color: '#E0E0E0' };
    let strength = 0;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;
    
    let color = '#E0E0E0';
    if (strength === 1) color = '#ef4444'; 
    else if (strength === 2) color = '#eab308'; 
    else if (strength === 3) color = '#a3e635'; 
    else if (strength >= 4) color = '#16a34a'; 
    return { level: strength, color };
  };

  const strengthInfo = getPasswordStrength(password);

  const handleRegister = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!fullname || !email || !password || !confirmPassword) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!isPasswordStrong(password)) {
      setErrorMsg("Mật khẩu chưa đủ mạnh. Cần ít nhất 8 ký tự, có chữ hoa, chữ thường và số.");
      return;
    }

    try {
      setLoading(true);
      const res = await signupAPI(fullname, email, password);
      setView("otp");
      setTimeLeft(300);
      setSuccessMsg(res.message || "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.");
    } catch (error: any) {
      if (!error.response) {
        setErrorMsg("Không thể kết nối đến máy chủ.");
      } else {
        setErrorMsg(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
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
      const res = await verifyOtpAPI(email, otp);
      if (res.token) {
        await SecureStore.setItemAsync('userToken', res.token);
        const userData = await checkAuthAPI();
        setUser(userData);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (!error.response) {
        setErrorMsg("Không thể kết nối đến máy chủ.");
      } else {
        setErrorMsg(error.response?.data?.message || "Xác thực thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      setLoading(true);
      await sendOtpAPI(email);
      setTimeLeft(300);
      setSuccessMsg("Đã gửi lại mã OTP tới email của bạn.");
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
              <TouchableOpacity style={styles.backPillButton} onPress={() => router.replace('/(auth)/login')}>
                <Ionicons name="arrow-back" size={16} color="#00A3FF" />
                <Text style={styles.backPillText}>Login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerContent}>
              {view === 'register' ? (
                <Text style={styles.headerSubtitle}>Register</Text>
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

          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {view === 'register' && (
            <View style={styles.form}>
              <Text style={styles.formHint}>Please enter your details below.</Text>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#A0A0A0"
                  value={fullname}
                  onChangeText={setFullname}
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
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
                  <View style={styles.rightIcons}>
                    {password.length > 0 && (
                      <Ionicons 
                        name={isPasswordStrong(password) ? "checkmark-circle" : "close-circle"} 
                        size={20} 
                        color={isPasswordStrong(password) ? "#22c55e" : "#ef4444"} 
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#A0A0A0" />
                    </TouchableOpacity>
                  </View>
                </View>
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    {[1, 2, 3, 4].map((level) => (
                      <View 
                        key={level} 
                        style={[
                          styles.strengthBar, 
                          { backgroundColor: level <= strengthInfo.level ? strengthInfo.color : '#E0E0E0' }
                        ]} 
                      />
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#A0A0A0"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <View style={styles.rightIcons}>
                    {confirmPassword.length > 0 && (
                      <Ionicons 
                        name={(password === confirmPassword && isPasswordStrong(password)) ? "checkmark-circle" : "close-circle"} 
                        size={20} 
                        color={(password === confirmPassword && isPasswordStrong(password)) ? "#22c55e" : "#ef4444"} 
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#A0A0A0" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.actionRow}>
                <View /> 
                <TouchableOpacity 
                  style={[styles.circularButton, loading && styles.buttonDisabled]} 
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-forward" size={24} color="#fff" />}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {view === 'otp' && (
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
                  onPress={() => { setView('register'); setErrorMsg(""); setOtp(""); setSuccessMsg(""); }}
                  disabled={loading}
                >
                  <Text style={styles.backLinkText}>Go back</Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  backPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  backPillText: {
    color: '#00A3FF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  headerContent: {
    paddingHorizontal: 24,
    marginTop: 30,
  },
  headerSubtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 40,
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
  successBox: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: '#10B981',
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
    paddingRight: 70, 
  },
  rightIcons: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  strengthContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 4,
  },
  strengthBar: {
    height: 4,
    width: 16,
    borderRadius: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
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
