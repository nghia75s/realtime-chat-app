import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { signupAPI, verifyOtpAPI, checkAuthAPI, sendOtpAPI } from '@/api/auth.api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type ViewState = "register" | "otp";

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
  
  const { setUser } = useAuthStore();
  const router = useRouter();

  const isPasswordStrong = (pwd: string) => {
    if (!pwd) return false;
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, color: '#d1d5db' };
    let strength = 0;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;
    
    let color = '#d1d5db';
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
      setErrorMsg("Vui lòng điền đầy đủ thông tin đăng ký");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!isPasswordStrong(password)) {
      setErrorMsg("Mật khẩu chưa đủ mạnh. Cần ít nhất 8 ký tự, có hoa, thường và số.");
      return;
    }

    try {
      setLoading(true);
      const res = await signupAPI(fullname, email, password);
      setView("otp");
      setSuccessMsg(res.message || "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.");
    } catch (error: any) {
      if (!error.response) {
        setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc IP.");
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
    setErrorMsg("");
    setSuccessMsg("");
    if (!email) return;
    try {
      setLoading(true);
      await sendOtpAPI(email);
      setSuccessMsg("Đã gửi lại mã OTP tới email của bạn.");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Không thể gửi lại mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={32} color="#fff" />
            </View>
            <Text style={styles.title}>{view === 'register' ? 'Tạo tài khoản mới' : 'Xác minh danh tính'}</Text>
            <Text style={styles.subtitle}>
              {view === 'register' ? 'Điền thông tin của bạn bên dưới để đăng ký' : `Nhập mã 6 số chúng tôi vừa gửi đến ${email}`}
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

          {view === 'register' ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và Tên</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#52525b"
                  value={fullname}
                  onChangeText={setFullname}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
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
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#52525b"
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
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#a1a1aa" />
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
                          { backgroundColor: level <= strengthInfo.level ? strengthInfo.color : '#4b5563' }
                        ]} 
                      />
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#52525b"
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
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#a1a1aa" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.linkText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
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
                onPress={() => {
                  setView('register');
                  setOtp('');
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={16} color="#a1a1aa" />
                <Text style={styles.backButtonText}>Quay lại</Text>
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
    marginBottom: 16,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 8,
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
    paddingRight: 70, 
  },
  rightIcons: {
    position: 'absolute',
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 4,
  },
  strengthBar: {
    height: 4,
    width: 12,
    borderRadius: 2,
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
