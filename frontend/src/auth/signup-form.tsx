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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8 flex items-center justify-center">
            <form onSubmit={handleSignupSubmit} className="w-full">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center mb-2">
                  <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
                  <p className="text-balance text-muted-foreground">
                    Điền thông tin của bạn bên dưới để đăng ký
                  </p>
                </div>

                <Field>
                  <FieldLabel>Họ và Tên</FieldLabel>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Nguyễn Văn A"
                  />
                </Field>

                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </Field>

                <Field>
                  <FieldLabel>Mật khẩu</FieldLabel>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pr-10"
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

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input pr-10"
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
                </Field>



                {error && (
                  <p className="text-sm rounded-md bg-destructive/10 text-destructive font-medium p-2 text-center border border-destructive/20">{error}</p>
                )}

                <Field>
                  <Button type="submit" disabled={isSigningUp} className="w-full">
                    {isSigningUp ? (<LoaderIcon className="w-full h-5 animate-spin text-center" />) : ("Đăng ký")}
                  </Button>
                </Field>

                <div className="text-center text-sm mt-4">
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-medium text-primary hover:underline underline-offset-4 transition-all"
                  >
                    Đăng nhập
                  </button>
                </div>
              </FieldGroup>
            </form>
          </div>

          <div className="relative hidden bg-muted md:block">
            <img
              src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop"
              alt="Decorative background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] grayscale-[0.2]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-10 left-10 p-4">
              <h2 className="text-white text-3xl font-bold max-w-sm mb-2">Tham gia cùng chúng tôi</h2>
              <p className="text-white/80 max-w-sm">Trở thành thành viên để trải nghiệm hệ thống chat bảo mật và tối ưu nhất.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="px-6 text-center text-sm text-balance text-muted-foreground">
        Bằng việc tạo tài khoản, bạn đồng ý với{" "}
        <a href="#" className="underline hover:text-foreground">Điều khoản dịch vụ</a> và{" "}
        <a href="#" className="underline hover:text-foreground">Chính sách bảo mật</a>
      </p>
    </div>
  )
}