import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2, ArrowLeft, LoaderIcon } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"

type ViewState = "login" | "2fa" | "forgot-password"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewState>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Login States
  const [formData, setFromData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoggingIn, authUser } = useAuthStore();

  // 2FA States
  const [otp, setOtp] = useState("")

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (authUser && view === "login") {
      setView("2fa")
    }
  }, [authUser, view])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ Tài khoản và Mật khẩu.")
      return
    }

    try {
      await login(formData)
    } catch (error: any) {
      const message = error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu."
      setError(message)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số mã xác thực.")
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      if (otp === "123456") {
        navigate("/chat")
      } else {
        setError("Mã xác thực không chính xác.")
      }
    }, 1000)
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8 flex items-center justify-center">
            {view === "login" && (
              <form onSubmit={handleLoginSubmit} className="w-full">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center mb-2">
                    <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
                    <p className="text-balance text-muted-foreground">
                      Đăng nhập vào tài khoản của bạn
                    </p>
                  </div>

                  <Field>
                    <FieldLabel>Tài khoản (Email)</FieldLabel>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      value={formData.email}
                      onChange={(e) => setFromData({...formData, email: e.target.value})}
                      className="input"
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center">
                      <FieldLabel>Mật khẩu</FieldLabel>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFromData({...formData, password: e.target.value})}
                        className="input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgot-password");
                          setError("");
                        }}
                        className="ml-auto text-sm underline-offset-4 hover:underline text-primary"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                  </Field>

                  {error && (
                    <p className="text-sm rounded-md bg-destructive/10 text-destructive font-medium p-2 text-center border border-destructive/20">{error}</p>
                  )}

                  <Field>
                    <Button type="submit" disabled={isLoggingIn} className="w-full">
                      {isLoggingIn ? (<LoaderIcon className="w-full h-5 animate-spin text-center" />) : ("Đăng nhập")}
                    </Button>
                  </Field>

                  <div className="text-center text-sm mt-4">
                    Chưa có tài khoản?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="font-medium text-primary hover:underline underline-offset-4 transition-all"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </FieldGroup>
              </form>
            )}

            {view === "2fa" && (
              <form onSubmit={handle2FASubmit} className="w-full">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center mb-2">
                    <h1 className="text-2xl font-bold">Xác minh danh tính</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                      Nhập mã gồm 6 số chúng tôi vừa gửi đến email của bạn
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="otp" className="text-center">Mã bảo mật (OTP)</FieldLabel>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      disabled={isLoading}
                      className={cn("text-center text-xl tracking-[0.5em] font-mono py-6", error ? "border-destructive" : "")}
                    />
                  </Field>

                  {error && (
                    <p className="text-sm rounded-md bg-destructive/10 text-destructive font-medium p-2 text-center border border-destructive/20">{error}</p>
                  )}

                  <Field>
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Xác nhận mã"}
                    </Button>
                  </Field>

                  <Field className="pt-2">
                    <Button
                      variant="ghost"
                      type="button"
                      disabled={isLoading}
                      className="w-full text-muted-foreground"
                      onClick={() => {
                        setView("login")
                        setError("")
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Đổi tài khoản khác
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}

            {view === "forgot-password" && (
              <form onSubmit={handleForgotSubmit} className="w-full">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center mb-2">
                    <h1 className="text-2xl font-bold">Khôi phục quyền truy cập</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                      Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="forgot-email">Địa chỉ Email</FieldLabel>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="m@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={isLoading || successMessage !== ""}
                      className={error ? "border-destructive" : ""}
                    />
                  </Field>

                  {error && (
                    <p className="text-sm rounded-md bg-destructive/10 text-destructive font-medium p-2 text-center border border-destructive/20">{error}</p>
                  )}

                  {successMessage && (
                    <p className="text-sm rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium p-3 text-center border border-emerald-500/20">
                      {successMessage}
                    </p>
                  )}

                  <Field>
                    <Button
                      type="submit"
                      disabled={isLoading || successMessage !== ""}
                      className="w-full"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : "Gửi liên kết khôi phục"}
                    </Button>
                  </Field>

                  <Field className="pt-2">
                    <Button
                      variant="ghost"
                      type="button"
                      disabled={isLoading || successMessage !== ""}
                      className="w-full text-muted-foreground"
                      onClick={() => {
                        setView("login")
                        setError("")
                        setSuccessMessage("")
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại đăng nhập
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </div>

          <div className="relative hidden bg-muted md:block">
            <img
              src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop"
              alt="Decorative background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] grayscale-[0.2]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-10 left-10 p-4">
              <h2 className="text-white text-3xl font-bold max-w-sm mb-2">Khám phá thế giới trò chuyện mới</h2>
              <p className="text-white/80 max-w-sm">Kết nối với bạn bè nhanh chóng, mượt mà và bảo mật. Đăng nhập để bắt đầu.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="px-6 text-center text-sm text-balance text-muted-foreground">
        Bằng việc tiếp tục, bạn đồng ý với{" "}
        <a href="#" className="underline hover:text-foreground">Điều khoản dịch vụ</a> và{" "}
        <a href="#" className="underline hover:text-foreground">Chính sách bảo mật</a>
      </p>
    </div>
  )
}
