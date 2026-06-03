import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2, ArrowLeft, LoaderIcon, MessageCircle } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"

type ViewState = "login" | "2fa" | "forgot-password"
type OtpType = "signup" | "login"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState<ViewState>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpType, setOtpType] = useState<OtpType>("signup")

  // Login States
  const [formData, setFromData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null)
  const { login, sendOtp, verifyOtp, verifyLoginOtp, isLoggingIn } = useAuthStore();

  // 2FA States
  const [otp, setOtp] = useState("")

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ Tài khoản và Mật khẩu.")
      return
    }

    setPendingCredentials(formData)

    try {
      await login(formData)
      navigate("/chat")
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu."
      
      // Check for 202 status (requires OTP for 2FA login)
      if (error?.response?.status === 202) {
        setOtpType("login")
        setView("2fa")
        setError("")
        setOtp("")
      } else if (error?.response?.status === 403) {
        // Email chưa verify (signup OTP verification)
        setOtpType("signup")
        try {
          await sendOtp(formData.email)
          setView("2fa")
        } catch (otpError: any) {
          setError("Không thể gửi mã OTP. Vui lòng thử lại sau.")
        }
      } else {
        setError(message)
      }
    }
  }

  useEffect(() => {
    const state = location.state as { email?: string; promptOtp?: boolean } | null
    if (state?.promptOtp) {
      setFromData((prev) => ({ ...prev, email: state.email || prev.email }))
      setView("2fa")
    }
  }, [location.state])

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã xác thực.")
      return
    }

    setIsLoading(true)
    try {
      const email = pendingCredentials?.email || formData.email
      if (!email) {
        setError("Vui lòng nhập email để xác thực.")
        return
      }

      if (otpType === "login") {
        // 2FA login verification
        await verifyLoginOtp({ email, otp })
        navigate("/chat")
      } else {
        // Signup email verification
        await verifyOtp({ email, otp })
        navigate("/chat")
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Xác thực thất bại. Vui lòng thử lại."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.")
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setSuccessMessage("Một tin nhắn khôi phục đã được gửi đến email của bạn")
      // Auto redirect sau 3s
      setTimeout(() => {
        setSuccessMessage("")
        setForgotEmail("")
        setView("login")
      }, 3000)
    }, 1000)
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full items-center font-['Times_New_Roman',_Times,_serif]", className)} {...props}>
      <div className="w-full rounded-[24px] border border-white/15 bg-white/[0.05] backdrop-blur-3xl shadow-[0_24px_50px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-8">
        
        {/* Left Column: Form */}
        <div className="w-full md:w-[48%] flex flex-col justify-center px-4 py-4 md:py-6">
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="w-full">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2 text-center mb-4">
                  {/* Overlapping logo speech bubbles */}
                  <div className="relative w-12 h-10 mb-2">
                    <div className="absolute top-0 left-0 w-7 h-7 rounded-full bg-[#38bdf8]/90 flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#6366f1]/90 flex items-center justify-center shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold font-serif text-white tracking-wide">Chào mừng trở lại</h1>
                  <p className="text-[14px] text-zinc-400">
                    Đăng nhập vào tài khoản của bạn
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-normal text-zinc-400">Tài khoản (Email)</label>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      value={formData.email}
                      onChange={(e) => setFromData({...formData, email: e.target.value})}
                      className="bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 px-3 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[14px] font-normal text-zinc-400">Mật khẩu</label>
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgot-password");
                          setError("");
                        }}
                        className="text-[14px] text-[#38bdf8] hover:underline transition-colors"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFromData({...formData, password: e.target.value})}
                        className="bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 pl-3 pr-10 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-[14px] rounded-md bg-red-500/10 text-red-400 font-medium p-2.5 text-center border border-red-500/20">{error}</p>
                )}

                <div>
                  <Button 
                    type="submit" 
                    disabled={isLoggingIn} 
                    className="w-full bg-gradient-to-r from-[#1d4ed8] to-[#7c3aed] text-white rounded-lg py-2.5 font-normal text-[16px] hover:from-[#2563eb] hover:to-[#8b5cf6] transition-all shadow-md focus:outline-none flex items-center justify-center"
                  >
                    {isLoggingIn ? (<LoaderIcon className="w-5 h-5 animate-spin" />) : ("Đăng nhập")}
                  </Button>
                </div>

                <div className="text-center text-[14px] text-zinc-400">
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="font-medium text-[#38bdf8] hover:underline transition-colors"
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </form>
          )}

          {view === "2fa" && (
            <form onSubmit={handle2FASubmit} className="w-full">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2 text-center mb-4">
                  {/* Overlapping logo speech bubbles */}
                  <div className="relative w-12 h-10 mb-2">
                    <div className="absolute top-0 left-0 w-7 h-7 rounded-full bg-[#38bdf8]/90 flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#6366f1]/90 flex items-center justify-center shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold font-serif text-white tracking-wide">Xác minh danh tính</h1>
                  <p className="text-[14px] text-zinc-400 text-balance">
                    Nhập mã gồm 6 số chúng tôi vừa gửi đến email của bạn
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="otp" className="text-[14px] font-normal text-zinc-400 text-center">Mã bảo mật (OTP)</label>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      disabled={isLoading}
                      className={cn("bg-black/35 border border-white/10 text-white text-center text-xl tracking-[0.5em] font-mono py-5 rounded-lg focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none", error ? "border-red-500/50" : "")}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-[14px] rounded-md bg-red-500/10 text-red-400 font-medium p-2.5 text-center border border-red-500/20">{error}</p>
                )}

                <div className="flex flex-col gap-2.5">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-gradient-to-r from-[#1d4ed8] to-[#7c3aed] text-white rounded-lg py-2.5 font-normal text-[16px] hover:from-[#2563eb] hover:to-[#8b5cf6] transition-all shadow-md focus:outline-none flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Xác nhận mã"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isLoading || !formData.email}
                    onClick={async () => {
                      setError("")
                      if (!formData.email) {
                        setError("Vui lòng nhập email để gửi lại mã OTP.")
                        return
                      }
                      setIsLoading(true)
                      try {
                        await sendOtp(formData.email)
                      } catch (error: any) {
                        setError(error?.response?.data?.message || "Không thể gửi lại mã OTP.")
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white rounded-lg py-2 text-[14px] transition-all"
                  >
                    Gửi lại mã OTP
                  </Button>

                  <button
                    type="button"
                    disabled={isLoading}
                    className="w-full text-zinc-400 hover:text-zinc-200 mt-2 text-[14px] flex items-center justify-center gap-1.5 transition-colors"
                    onClick={() => {
                      setView("login")
                      setError("")
                    }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Đổi tài khoản khác
                  </button>
                </div>
              </div>
            </form>
          )}

          {view === "forgot-password" && (
            <form onSubmit={handleForgotSubmit} className="w-full">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2 text-center mb-4">
                  {/* Overlapping logo speech bubbles */}
                  <div className="relative w-12 h-10 mb-2">
                    <div className="absolute top-0 left-0 w-7 h-7 rounded-full bg-[#38bdf8]/90 flex items-center justify-center shadow-[0_2px_10px_rgba(56,189,248,0.3)]">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#6366f1]/90 flex items-center justify-center shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Khôi phục quyền truy cập</h1>
                  <p className="text-[14px] text-zinc-400 text-balance">
                    Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="forgot-email" className="text-[14px] font-normal text-zinc-400">Địa chỉ Email</label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="m@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={isLoading || successMessage !== ""}
                      className={cn("bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 px-3 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full", error ? "border-red-500/50" : "")}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-[14px] rounded-md bg-red-500/10 text-red-400 font-medium p-2.5 text-center border border-red-500/20">{error}</p>
                )}

                {successMessage && (
                  <p className="text-[14px] rounded-md bg-emerald-500/10 text-emerald-400 font-medium p-2.5 text-center border border-emerald-500/20">
                    {successMessage}
                  </p>
                )}

                <div className="flex flex-col gap-2.5">
                  <Button
                    type="submit"
                    disabled={isLoading || successMessage !== ""}
                    className="w-full bg-gradient-to-r from-[#1d4ed8] to-[#7c3aed] text-white rounded-lg py-2.5 font-normal text-[16px] hover:from-[#2563eb] hover:to-[#8b5cf6] transition-all shadow-md focus:outline-none flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Gửi liên kết khôi phục"}
                  </Button>

                  <button
                    type="button"
                    disabled={isLoading || successMessage !== ""}
                    className="w-full text-zinc-400 hover:text-zinc-200 mt-2 text-[14px] flex items-center justify-center gap-1.5 transition-colors"
                    onClick={() => {
                      setView("login")
                      setError("")
                      setSuccessMessage("")
                    }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Quay lại đăng nhập
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Visual illustration panel */}
        <div className="hidden md:flex w-[52%] rounded-[18px] bg-gradient-to-br from-[#121c33] via-[#0f172a] to-[#25103c] border border-white/5 relative overflow-hidden flex-col justify-between p-10 select-none min-h-[460px]">
          
          {/* Floating Bubble Illustration */}
          <div className="relative w-full h-[220px] flex items-center justify-center mb-6">
            {/* Blurs */}
            <div className="absolute w-[200px] h-[200px] rounded-full bg-cyan-500/10 blur-[50px] pointer-events-none" />
            <div className="absolute w-[180px] h-[180px] rounded-full bg-purple-500/10 blur-[50px] pointer-events-none" />
            
            {/* SVG Network Graph Connection Lines */}
            <svg className="absolute inset-0 w-full h-full text-white/5" viewBox="0 0 300 200" fill="none">
              <path d="M 50 150 L 100 120 L 150 150 L 200 90 L 250 140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M 80 80 L 150 150 L 220 70" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="50" cy="150" r="3" className="fill-cyan-400/40 animate-pulse" />
              <circle cx="100" cy="120" r="3" className="fill-indigo-400/40" />
              <circle cx="150" cy="150" r="4" className="fill-purple-400/40 animate-pulse" />
              <circle cx="200" cy="90" r="3" className="fill-pink-400/40" />
              <circle cx="250" cy="140" r="3" className="fill-cyan-400/40" />
              <circle cx="80" cy="80" r="3" className="fill-purple-400/40" />
              <circle cx="220" cy="70" r="3" className="fill-indigo-400/40" />
            </svg>
            
            {/* Emoji Bubble cards - resized larger */}
            <div className="absolute top-[20px] left-[20px] bg-purple-500/10 border border-purple-500/30 rounded-[18px] w-16 h-16 shadow-lg backdrop-blur-md animate-[bounce_4s_infinite_1s] flex items-center justify-center">
              <span className="text-3xl">💜</span>
            </div>
            
            <div className="absolute top-[5px] right-[30px] bg-teal-500/10 border border-teal-500/30 rounded-[18px] w-16 h-16 shadow-lg backdrop-blur-md animate-[bounce_4.5s_infinite] flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            
            <div className="absolute bottom-[20px] right-[10px] bg-indigo-500/10 border border-indigo-500/30 rounded-[18px] w-16 h-16 shadow-lg backdrop-blur-md animate-[bounce_5s_infinite_0.5s] flex items-center justify-center">
              <span className="text-3xl">📄</span>
            </div>
            
            <div className="absolute bottom-[10px] left-[30px] bg-pink-500/10 border border-pink-500/30 rounded-[18px] w-16 h-16 shadow-lg backdrop-blur-md animate-[bounce_3.5s_infinite_1.5s] flex items-center justify-center">
              <span className="text-3xl">💖</span>
            </div>

            {/* Glowing 3D Glass Chat Bubble in center - resized larger */}
            <div className="z-10 bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 border border-cyan-400/30 rounded-[28px] w-36 h-24 shadow-[0_10px_25px_rgba(6,182,212,0.15)] backdrop-blur-lg flex items-center justify-center animate-pulse">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-200 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 rounded-full bg-cyan-200 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 rounded-full bg-cyan-200 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[#38bdf8] text-[24px] font-extrabold max-w-sm mb-3 tracking-wide leading-tight">
              Khám phá thế giới trò chuyện mới
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed max-w-sm font-light">
              Kết nối với bạn bè nhanh chóng, mượt mà và bảo mật. Đăng nhập để bắt đầu.
            </p>
          </div>
        </div>

      </div>

      <p className="px-6 text-center text-[15px] text-zinc-500 pointer-events-none">
        Bằng việc tiếp tục, bạn đồng ý với{" "}
        <a href="#" className="underline text-zinc-400 hover:text-zinc-200 pointer-events-auto">Điều khoản dịch vụ</a> và{" "}
        <a href="#" className="underline text-zinc-400 hover:text-zinc-200 pointer-events-auto">Chính sách bảo mật</a>
      </p>
    </div>
  )
}
