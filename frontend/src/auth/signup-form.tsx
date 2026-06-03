import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, LoaderIcon, Check, X } from "lucide-react"

import { useAuthStore } from "@/store/useAuthStore"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  const { signup, isSigningUp, authUser } = useAuthStore();
  const navigate = useNavigate();

  // Hàm kiểm tra mật khẩu đạt đủ điều kiện
  const isPasswordStrong = (password: string): boolean => {
    if (!password) return false;
    // Kiểm tra: ít nhất 8 ký tự, có chữ hoa, chữ thường, và số
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  // Hàm tính độ mạnh của mật khẩu (0-4)
  const getPasswordStrength = (password: string): { level: number; color: string } => {
    if (!password) return { level: 0, color: "bg-gray-300" };

    let strength = 0;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasLowerCase) strength++;
    if (hasUpperCase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    // Xác định màu dựa trên mức độ
    let color = "bg-gray-300";
    if (strength === 1) color = "bg-red-500";
    else if (strength === 2) color = "bg-yellow-500";
    else if (strength === 3) color = "bg-lime-400";
    else if (strength === 4) color = "bg-green-600";

    return { level: strength, color };
  };

  // Hàm kiểm tra mật khẩu khớp
  const isPasswordMatch = (): boolean => {
    return formData.password === formData.confirmPassword;
  };

  useEffect(() => {
    if (authUser) {
      navigate("/chat")
    }
  }, [authUser, navigate])

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("")

    // Validate client-side trước khi gửi
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin đăng ký");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    const payload = {
      fullname: formData.name,
      email: formData.email,
      password: formData.password,
    };

    try {
      await signup(payload);
      navigate("/login", { state: { email: formData.email, promptOtp: true } });
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      setError(message)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full items-center font-['Times_New_Roman',_Times,_serif]", className)} {...props}>
      <div className="w-full rounded-[24px] border border-white/15 bg-white/[0.05] backdrop-blur-3xl shadow-[0_24px_50px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-8">

        {/* Left Column: Form */}
        <div className="w-full md:w-[48%] flex flex-col justify-center px-4 py-4 md:py-6">
          <form onSubmit={handleSignupSubmit} className="w-full">
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
                <h1 className="text-3xl font-bold font-serif text-white tracking-wide">Tạo tài khoản mới</h1>
                <p className="text-[14px] text-zinc-400">
                  Điền thông tin của bạn bên dưới để đăng ký
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-normal text-zinc-400">Họ và Tên</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 px-3 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-normal text-zinc-400">Email</label>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 px-3 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-normal text-zinc-400">Mật khẩu</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 pl-3 pr-10 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {formData.password && (
                        isPasswordStrong(formData.password) ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <X size={18} className="text-red-500" />
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Thanh độ mạnh mật khẩu nhỏ */}
                  {formData.password && (
                    <div className="flex gap-0.5 mt-1 justify-end">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1 w-3 rounded-full transition-colors ${step <= getPasswordStrength(formData.password).level
                              ? getPasswordStrength(formData.password).color
                              : "bg-gray-300 dark:bg-gray-600"
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </Field>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-[14px] font-normal text-zinc-400">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="bg-black/35 border border-white/10 text-white placeholder:text-zinc-600 rounded-lg py-2.5 pl-3 pr-10 text-[15px] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all outline-none w-full"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {formData.confirmPassword && (
                        !isPasswordStrong(formData.password) ? (
                          <X size={18} className="text-red-500" />
                        ) : isPasswordMatch() ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <X size={18} className="text-red-500" />
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-[14px] rounded-md bg-red-500/10 text-red-400 font-medium p-2.5 text-center border border-red-500/20">{error}</p>
              )}

              <div>
                <Button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full bg-gradient-to-r from-[#1d4ed8] to-[#7c3aed] text-white rounded-lg py-2.5 font-bold text-[16px] hover:from-[#2563eb] hover:to-[#8b5cf6] transition-all shadow-md focus:outline-none flex items-center justify-center"
                >
                  {isSigningUp ? (<LoaderIcon className="w-5 h-5 animate-spin" />) : ("Đăng ký")}
                </Button>
              </div>

              <div className="text-center text-[14px] text-zinc-400">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-[#38bdf8] hover:underline transition-colors"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </form>
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
              Tham gia cùng chúng tôi
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed max-w-sm font-light">
              Trở thành thành viên để trải nghiệm hệ thống chat bảo mật và tối ưu nhất.
            </p>
          </div>
        </div>

      </div>

      <p className="px-6 text-center text-[15px] text-zinc-500 pointer-events-none">
        Bằng việc tạo tài khoản, bạn đồng ý với{" "}
        <a href="#" className="underline text-zinc-400 hover:text-zinc-200 pointer-events-auto">Điều khoản dịch vụ</a> và{" "}
        <a href="#" className="underline text-zinc-400 hover:text-zinc-200 pointer-events-auto">Chính sách bảo mật</a>
      </p>
    </div>
  )
}
