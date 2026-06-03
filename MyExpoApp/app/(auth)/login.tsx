import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { loginAPI, verifyLoginOtpAPI, checkAuthAPI, sendOtpAPI } from '@/api/auth.api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type ViewState = "login" | "2fa" | "forgot-password";

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
  
  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ Tài khoản và Mật khẩu.");
      return;
    }
    
    try {
      setLoading(true);
      const res = await loginAPI(email, password);
      // Backend returns 202 if OTP is required for 2FA
      if (res.requiresOtp) {
        setView("2fa");
      } else {
        // If it returns token directly (depends on backend logic, currently backend returns 202 for all logins)
        if (res.token) {
          await SecureStore.setItemAsync('userToken', res.token);
          const userData = await checkAuthAPI();
          setUser(userData);
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      if (!error.response) {
        setErrorMsg(`Không thể kết nối đến: ${loginAPI.toString().includes('apiClient') ? 'API' : ''} (Check IP). Lỗi: ${error.message}`);
        return;
      }
      if (error.response?.status === 403) {
        // Email chưa verify (cần OTP đăng ký)
        try {
          await sendOtpAPI(email);
          setView("2fa"); // Sẽ verify như signup OTP, nhưng api xác thực khác nhau. Tạm thời dùng chung verifyLoginOtpAPI hoặc báo lỗi
          setErrorMsg("Tài khoản chưa xác thực. Đã gửi lại mã OTP tới email của bạn.");
        } catch (e) {
          setErrorMsg("Tài khoản chưa xác thực và không thể gửi lại mã OTP.");
        }
      } else if (error.response?.status === 202) {
        setView("2fa");
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
    setErrorMsg("");
    if (!email) return;
    try {
      setLoading(true);
      await sendOtpAPI(email);
      Alert.alert("Thành công", "Đã gửi lại mã OTP");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Không thể gửi lại mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!forgotEmail) {
      setErrorMsg("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    
    setLoading(true);
    // Fake API call like web app
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Một tin nhắn khôi phục đã được gửi đến email của bạn");
      setTimeout(() => {
        setSuccessMsg("");
        setForgotEmail("");
        setView("login");
      }, 3000);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={32} color="#fff" />
            </View>
            <Text style={styles.title}>
              {view === 'login' && 'Chào mừng trở lại'}
              {view === '2fa' && 'Xác minh danh tính'}
              {view === 'forgot-password' && 'Khôi phục quyền truy cập'}
            </Text>
            <Text style={styles.subtitle}>
              {view === 'login' && 'Đăng nhập vào tài khoản của bạn'}
              {view === '2fa' && `Nhập mã gồm 6 số chúng tôi vừa gửi đến email của bạn`}
              {view === 'forgot-password' && 'Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu'}
            </Text>
          </View>
          
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
          
          {view === 'login' && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tài khoản (Email)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="m@example.com"
                  placeholderTextColor="#52525b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <TouchableOpacity onPress={() => { setView('forgot-password'); setErrorMsg(""); }}>
                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#52525b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#a1a1aa" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.linkText}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {view === '2fa' && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { textAlign: 'center' }]}>Mã bảo mật (OTP)</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="------"
                  placeholderTextColor="#52525b"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Xác nhận mã</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.buttonSecondary, loading && styles.buttonDisabled]} 
                onPress={handleResendOtp}
                disabled={loading || !email}
              >
                <Text style={styles.buttonSecondaryText}>Gửi lại mã OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => { setView('login'); setErrorMsg(""); setOtp(""); }}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={16} color="#a1a1aa" />
                <Text style={styles.backButtonText}>Đổi tài khoản khác</Text>
              </TouchableOpacity>
            </View>
          )}

          {view === 'forgot-password' && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa chỉ Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="m@example.com"
                  placeholderTextColor="#52525b"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, (loading || successMsg !== "") && styles.buttonDisabled]} 
                onPress={handleForgotPassword}
                disabled={loading || successMsg !== ""}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gửi liên kết khôi phục</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => { setView('login'); setErrorMsg(""); setSuccessMsg(""); }}
                disabled={loading || successMsg !== ""}
              >
                <Ionicons name="arrow-back" size={16} color="#a1a1aa" />
                <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
              </TouchableOpacity>
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
    backgroundColor: '#070913', 
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    fontSize: 14,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  successText: {
    color: '#34d399',
    textAlign: 'center',
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forgotText: {
    color: '#38bdf8',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#fff',
    padding: 14,
    fontSize: 15,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 10,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#3b82f6', 
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonSecondaryText: {
    color: '#d4d4d8',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  linkText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#a1a1aa',
    fontSize: 14,
    marginLeft: 6,
  },
});
